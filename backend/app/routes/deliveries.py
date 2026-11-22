from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.delivery import Delivery
from app.models.organization import Organization
from app.models.mixins import utcnow
from app.schemas.delivery_schema import DeliveryCreateSchema, DeliveryUpdateSchema, DeliverySchema
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
    "failed": set()
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

@bp.post("")
@role_required("agency")
def create_delivery():
    from app.models.assistance_request import AssistanceRequest

    user = get_current_user()
    data = parse_body(DeliveryCreateSchema())

    assistance_request = db.session.get(AssistanceRequest, data["request_id"])
    if assistance_request is None:
        raise ApiError(404, "not_found", "Assistance request not found")

    organization = db.session.scalar(
        select(Organization).where(
            Organization.id == assistance_request.organization_id,
            Organization.owner_id == user.id
        )
    )

    if organization is None:
        raise ApiError(404, "not_found", "Assistance request not found")

    if data.get("pledge_id") is not None:
        raise ApiError(409, "pledge_integration_pending", "Pledged deliveries require donor pledge integration")

    delivery = Delivery(
        request_id=assistance_request.id,
        organization_id=organization.id,
        pledge_id=None,
        status="pending"
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
    new_status = data["status"]

    validate_transition(delivery.status, new_status)

    delivery.status = new_status

    if new_status == "in_transit":
        delivery.dispatched_at = utcnow()

    if new_status == "delivered":
        delivery.delivered_at = utcnow()

    db.session.commit()

    return jsonify({"delivery": DeliverySchema().dump(delivery)})