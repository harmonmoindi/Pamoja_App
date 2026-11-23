from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.delivery import Delivery
from app.models.receipt_confirmation import ReceiptConfirmation
from app.schemas.receipt_schema import ReceiptConfirmationSchema, ReceiptCreateSchema
from app.services import audit_service, notification_service
from app.utils.decorators import get_current_user, role_required
from app.utils.validators import parse_body

bp = Blueprint("receipts", __name__, url_prefix="/api/receipts")


@bp.post("")
@role_required("beneficiary")
def confirm_receipt():
    """Beneficiary confirms (or disputes) receipt of a delivered assistance package."""
    beneficiary = get_current_user()
    data = parse_body(ReceiptCreateSchema())

    delivery = db.session.scalar(
        select(Delivery)
        .where(Delivery.id == data["delivery_id"])
        .with_for_update()
    )
    if delivery is None:
        raise ApiError(404, "not_found", "Delivery not found")

    assistance_request = db.session.get(AssistanceRequest, delivery.request_id)
    if assistance_request is None or assistance_request.beneficiary_id != beneficiary.id:
        raise ApiError(404, "not_found", "Delivery not found")

    if delivery.status != "delivered":
        raise ApiError(
            409,
            "not_delivered",
            "Only deliveries marked as delivered can be confirmed",
        )

    existing = db.session.scalar(
        select(ReceiptConfirmation).where(ReceiptConfirmation.delivery_id == delivery.id)
    )
    if existing is not None:
        raise ApiError(409, "already_confirmed", "This delivery has already been confirmed")

    receipt = ReceiptConfirmation(
        delivery_id=delivery.id,
        request_id=assistance_request.id,
        beneficiary_id=beneficiary.id,
        outcome=data["outcome"],
        comments=data.get("comments"),
    )
    db.session.add(receipt)

    if data["outcome"] == "complete":
        assistance_request.stage = "Confirmed"
        title = "Delivery confirmed"
        description = f"Beneficiary confirmed complete receipt for {delivery.reference or delivery.id}"
    else:
        title = "Delivery discrepancy reported"
        description = (
            f"Beneficiary reported '{data['outcome']}' for "
            f"{delivery.reference or delivery.id}"
        )

    audit_service.log_event(
        "delivery",
        title,
        description,
        actor=beneficiary,
        entity_type="delivery",
        entity_id=delivery.id,
        commit=False,
    )

    if assistance_request.organization_id is not None:
        from app.models.organization import Organization

        organization = db.session.get(Organization, assistance_request.organization_id)
        if organization is not None and organization.owner_id is not None:
            notification_service.notify(
                organization.owner_id,
                title,
                description,
                kind="delivery",
                commit=False,
            )

    db.session.commit()

    return jsonify({"receipt": ReceiptConfirmationSchema().dump(receipt)}), 201
