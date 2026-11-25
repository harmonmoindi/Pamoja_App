from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db

from app.models.assistance_request import AssistanceRequest
from app.models.inventory_item import InventoryItem
from app.models.organization import Organization

from app.schemas.matching_schema import AllocationCreateSchema

from app.services import audit_service
from app.services.matching_service import (
    suggest_matches,
    normalize,
    validate_allocation,
)

from app.utils.decorators import get_current_user, role_required
from app.utils.validators import parse_body


bp = Blueprint("matching", __name__)


# ============================================================
# GET MATCHING RESOURCES
# GET /api/matching/<request_id>
# ============================================================

@bp.get("/api/matching/<int:request_id>")
@role_required("agency")
def get_matches(request_id):

    user = get_current_user()

    # Retrieve a request assigned to the logged-in agency.
    assistance_request = db.session.scalar(
        select(AssistanceRequest)
        .join(
            Organization,
            AssistanceRequest.organization_id == Organization.id
        )
        .where(
            AssistanceRequest.id == request_id,
            Organization.owner_id == user.id
        )
    )

    if assistance_request is None:
        raise ApiError(
            404,
            "not_found",
            "Assistance request not found"
        )

    # Retrieve inventory belonging to the agency.
    inventory = db.session.scalars(
        select(InventoryItem)
        .where(
            InventoryItem.organization_id
            == assistance_request.organization_id
        )
    ).all()

    # Beneficiary resource requirements.
    need = {
        "category": assistance_request.category,
        "county": assistance_request.county,
        "required": assistance_request.quantity,
        "allocated": assistance_request.allocated,
        "unit": assistance_request.unit
    }

    resources = []

    for item in inventory:

        # Match the specific resource requested.
        if normalize(item.name) != normalize(
            assistance_request.resource
        ):
            continue

        # Preserve minimum inventory stock.
        available = max(
            0,
            item.quantity - max(item.minimum, 0)
        )

        resources.append({
            "id": item.id,
            "category": item.category,
            "county": item.county,
            "available": available,
            "unit": item.unit
        })

    # Find compatible resources.
    matches = suggest_matches(need, resources)

    # Calculate outstanding request quantity.
    remaining = max(
        assistance_request.quantity - assistance_request.allocated,
        0
    )

    return jsonify({
        "requestId": assistance_request.id,
        "required": assistance_request.quantity,
        "allocated": assistance_request.allocated,
        "remaining": remaining,
        "matches": matches
    }), 200


# ============================================================
# ALLOCATE RESOURCES
# POST /api/matching/allocate
# ============================================================

@bp.post("/api/matching/allocate")
@role_required("agency")
def allocate_resources():

    user = get_current_user()

    # Validate incoming JSON data.
    data = parse_body(AllocationCreateSchema())

    request_id = data["request_id"]
    resource_id = data["resource_id"]
    quantity = data["quantity"]

    # --------------------------------------------------------
    # 1. Retrieve and lock the beneficiary request.
    # --------------------------------------------------------

    assistance_request = db.session.scalar(
        select(AssistanceRequest)
        .join(
            Organization,
            AssistanceRequest.organization_id == Organization.id
        )
        .where(
            AssistanceRequest.id == request_id,
            Organization.owner_id == user.id
        )
        .with_for_update(of=AssistanceRequest)
    )

    if assistance_request is None:
        raise ApiError(
            404,
            "not_found",
            "Assistance request not found"
        )

    # --------------------------------------------------------
    # 2. Confirm that the request can receive resources.
    # --------------------------------------------------------

    allowed_stages = {
        "Assessed",
        "Published",
        "Pledged",
        "Allocated"
    }

    if assistance_request.stage not in allowed_stages:
        raise ApiError(
            409,
            "invalid_request_stage",
            "Request must be assessed before resources can be allocated"
        )

    # --------------------------------------------------------
    # 3. Retrieve and lock agency inventory.
    # --------------------------------------------------------

    inventory = db.session.scalar(
        select(InventoryItem)
        .where(
            InventoryItem.id == resource_id,
            InventoryItem.organization_id
            == assistance_request.organization_id
        )
        .with_for_update()
    )

    if inventory is None:
        raise ApiError(
            404,
            "not_found",
            "Inventory item not found"
        )

    # --------------------------------------------------------
    # 4. Confirm resource names match.
    # --------------------------------------------------------

    if normalize(inventory.name) != normalize(
        assistance_request.resource
    ):
        raise ApiError(
            400,
            "resource_mismatch",
            "Inventory item does not match the requested resource"
        )

    # --------------------------------------------------------
    # 5. Calculate available stock.
    # --------------------------------------------------------

    available = max(
        0,
        inventory.quantity - max(inventory.minimum, 0)
    )

    # Prepare beneficiary requirement.
    need = {
        "category": assistance_request.category,
        "required": assistance_request.quantity,
        "allocated": assistance_request.allocated,
        "unit": assistance_request.unit
    }

    # Prepare available inventory.
    resource = {
        "category": inventory.category,
        "available": available,
        "unit": inventory.unit
    }

    # --------------------------------------------------------
    # 6. Validate the requested allocation.
    # --------------------------------------------------------

    try:
        validate_allocation(
            need,
            resource,
            quantity
        )

    except ValueError as error:
        raise ApiError(
            409,
            "allocation_conflict",
            str(error)
        ) from error

    # --------------------------------------------------------
    # 7. Update inventory and request quantities.
    # --------------------------------------------------------

    inventory.quantity -= quantity

    assistance_request.allocated += quantity

    # Calculate remaining beneficiary need.
    remaining = max(
        assistance_request.quantity - assistance_request.allocated,
        0
    )

    # Mark fully allocated requests.
    if remaining == 0:
        assistance_request.stage = "Allocated"

    # --------------------------------------------------------
    # 8. Record the allocation in the audit log.
    # --------------------------------------------------------

    audit_service.log_event(
        "request",
        "Resources allocated",
        (
            f"Allocated {quantity} {inventory.unit} of "
            f"{inventory.name} from inventory {inventory.id} "
            f"to request {assistance_request.reference}"
        ),
        actor=user,
        entity_type="assistance_request",
        entity_id=assistance_request.id,
        commit=False
    )

    # --------------------------------------------------------
    # 9. Commit the transaction.
    # --------------------------------------------------------

    db.session.commit()

    # --------------------------------------------------------
    # 10. Return allocation details.
    # --------------------------------------------------------

    return jsonify({
        "message": "Resources allocated successfully",
        "requestId": assistance_request.id,
        "resourceId": inventory.id,
        "allocatedQuantity": quantity,
        "totalAllocated": assistance_request.allocated,
        "remaining": remaining,
        "inventoryRemaining": inventory.quantity,
        "available": max(
            0,
            inventory.quantity - max(inventory.minimum, 0)
        )
    }), 200