from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.delivery import Delivery
from app.models.mixins import utcnow
from app.models.organization import Organization
from app.schemas.delivery_schema import DeliveryCreateSchema, DeliverySchema, DeliveryUpdateSchema
from app.services import notification_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.reference_ids import make_reference
from app.utils.validators import parse_body

bp = Blueprint("deliveries", __name__, url_prefix="/api/deliveries")
TRANSITIONS = {
    "pending": {"assigned"},
    "assigned": {"in_transit", "failed"},
    "in_transit": {"delivered", "failed"},
    "delivered": set(),
    "failed": set(),
}


def validate_transition(current, new):
    if new not in TRANSITIONS.get(current, set()):
        raise ApiError(409, "invalid_transition", f"Cannot change delivery from {current} to {new}")
    return True


def get_agency_delivery(delivery_id, user_id):
    delivery = db.session.scalar(
        select(Delivery)
        .join(Organization, Delivery.organization_id == Organization.id)
        .where(Delivery.id == delivery_id, Organization.owner_id == user_id)
        .with_for_update()
    )
    if delivery is None:
        raise ApiError(404, "not_found", "Delivery not found")
    return delivery


@bp.get("")
@role_required("agency")
def list_deliveries():
    user = get_current_user()
    stmt = (
        select(Delivery)
        .join(Organization, Delivery.organization_id == Organization.id)
        .where(Organization.owner_id == user.id)
        .order_by(Delivery.created_at.desc())
    )
    return jsonify(paginate(stmt, DeliverySchema()))


@bp.get("/mine")
@role_required("beneficiary")
def my_deliveries():
    """Deliveries tied to the logged-in beneficiary's assistance requests."""
    beneficiary = get_current_user()
    stmt = (
        select(Delivery)
        .join(AssistanceRequest, Delivery.request_id == AssistanceRequest.id)
        .where(AssistanceRequest.beneficiary_id == beneficiary.id)
        .order_by(Delivery.created_at.desc())
    )
    return jsonify(paginate(stmt, DeliverySchema()))


@bp.post("")
@role_required("agency")
def create_delivery():
    user = get_current_user()
    data = parse_body(DeliveryCreateSchema())

    request = db.session.scalar(
        select(AssistanceRequest)
        .join(Organization, AssistanceRequest.organization_id == Organization.id)
        .where(AssistanceRequest.id == data["request_id"], Organization.owner_id == user.id)
        .with_for_update(of=AssistanceRequest)
    )
    if request is None:
        raise ApiError(404, "not_found", "Assistance request not found")

    if data.get("pledge_id") is not None:
        raise ApiError(409, "pledge_integration_pending", "Pledged deliveries require donor pledge integration")

    if request.stage != "Allocated" or request.quantity <= 0 or request.allocated < request.quantity:
        raise ApiError(409, "not_fully_allocated", "Fully allocate resources before creating a delivery")

    existing = db.session.scalar(
        select(Delivery).where(Delivery.request_id == request.id, Delivery.status != "failed")
    )
    if existing:
        raise ApiError(409, "delivery_exists", "An active or completed delivery already exists for this request")

    delivery = Delivery(
        request_id=request.id,
        organization_id=request.organization_id,
        pledge_id=None,
        status="pending",
    )
    db.session.add(delivery)
    db.session.flush()
    delivery.reference = make_reference("DEL", delivery.id)
    db.session.commit()

    return jsonify({"delivery": DeliverySchema().dump(delivery)}), 201


@bp.patch("/<int:delivery_id>")
@role_required("agency")
def update_delivery(delivery_id):
    user = get_current_user()
    data = parse_body(DeliveryUpdateSchema())
    delivery = get_agency_delivery(delivery_id, user.id)
    validate_transition(delivery.status, data["status"])

    delivery.status = data["status"]

    if delivery.status == "in_transit":
        delivery.dispatched_at = utcnow()

    if delivery.status == "delivered":
        delivery.delivered_at = utcnow()
        request = db.session.get(AssistanceRequest, delivery.request_id)
        if request is not None and request.stage != "Confirmed":
            request.stage = "Delivered"
            notification_service.notify(
                request.beneficiary_id,
                "Assistance delivered",
                (
                    f"{delivery.reference or delivery.id} for "
                    f"{request.reference or request.id} is ready to confirm."
                ),
                kind="delivery",
                commit=False,
            )

    db.session.commit()
    return jsonify({"delivery": DeliverySchema().dump(delivery)})
