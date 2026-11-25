from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.inventory_item import InventoryItem
from app.models.organization import Organization
from app.schemas.inventory_schema import (
    InventoryItemCreateSchema,
    InventoryItemSchema,
    InventoryItemUpdateSchema,
)
from app.services import audit_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.reference_ids import make_reference
from app.utils.validators import parse_body

bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")


def _owned_organization(user_id: int) -> Organization:
    organization = db.session.scalar(
        select(Organization).where(Organization.owner_id == user_id).order_by(Organization.id)
    )
    if organization is None:
        raise ApiError(404, "not_found", "Organization not found")
    return organization


def _get_agency_item(item_id: int, user_id: int) -> InventoryItem:
    item = db.session.scalar(
        select(InventoryItem)
        .join(Organization, InventoryItem.organization_id == Organization.id)
        .where(InventoryItem.id == item_id, Organization.owner_id == user_id)
        .with_for_update()
    )
    if item is None:
        raise ApiError(404, "not_found", "Inventory item not found")
    return item


@bp.get("")
@role_required("agency")
def list_inventory():
    """Stock held by organizations the logged-in agency owns."""
    user = get_current_user()
    stmt = (
        select(InventoryItem)
        .join(Organization, InventoryItem.organization_id == Organization.id)
        .where(Organization.owner_id == user.id)
        .order_by(InventoryItem.created_at.desc(), InventoryItem.id.desc())
    )
    return jsonify(paginate(stmt, InventoryItemSchema()))


@bp.post("")
@role_required("agency")
def create_inventory():
    """Add a stock item to the agency's organization."""
    user = get_current_user()
    data = parse_body(InventoryItemCreateSchema())
    organization = _owned_organization(user.id)

    item = InventoryItem(
        organization_id=organization.id,
        name=data["name"].strip(),
        category=data["category"].strip(),
        county=data["county"].strip(),
        quantity=data["quantity"],
        unit=(data.get("unit") or "units").strip(),
        minimum=data["minimum"],
    )
    db.session.add(item)
    db.session.flush()
    item.reference = make_reference("INV", item.id)

    audit_service.log_event(
        "agency",
        "Inventory item added",
        f"{item.reference}: {item.quantity} {item.unit} of {item.name}",
        actor=user,
        entity_type="inventory_item",
        entity_id=item.id,
        commit=False,
    )
    db.session.commit()
    return jsonify({"item": InventoryItemSchema().dump(item)}), 201


@bp.patch("/<int:item_id>")
@role_required("agency")
def update_inventory(item_id):
    """Update stock for an item the agency owns. Quantity cannot go below zero."""
    user = get_current_user()
    data = parse_body(InventoryItemUpdateSchema())
    if not data:
        raise ApiError(400, "validation_error", "No stock changes were provided")

    item = _get_agency_item(item_id, user.id)
    previous_quantity = item.quantity

    for field in ("name", "category", "county", "unit"):
        if field in data:
            setattr(item, field, data[field].strip())
    if "quantity" in data:
        item.quantity = data["quantity"]
    if "minimum" in data:
        item.minimum = data["minimum"]

    audit_service.log_event(
        "agency",
        "Inventory stock updated",
        f"{item.reference or item.id}: quantity {previous_quantity} to {item.quantity} {item.unit}",
        actor=user,
        entity_type="inventory_item",
        entity_id=item.id,
        commit=False,
    )
    db.session.commit()
    return jsonify({"item": InventoryItemSchema().dump(item)})
