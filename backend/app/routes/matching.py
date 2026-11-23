from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db

from app.models.assistance_request import AssistanceRequest
from app.models.inventory_item import InventoryItem
from app.models.organization import Organization

from app.services.matching_service import suggest_matches, normalize

from app.utils.decorators import get_current_user, role_required


bp = Blueprint("matching", __name__)


@bp.get("/api/matching/<int:request_id>")
@role_required("agency")
def get_matches(request_id):

    user = get_current_user()

    # Find a request belonging to the logged-in agency.
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

    # Retrieve inventory belonging to the assigned agency.
    inventory = db.session.scalars(
        select(InventoryItem)
        .where(
            InventoryItem.organization_id
            == assistance_request.organization_id
        )
    ).all()

    # Prepare the beneficiary's requirements.
    need = {
        "category": assistance_request.category,
        "county": assistance_request.county,
        "required": assistance_request.quantity,
        "allocated": assistance_request.allocated,
        "unit": assistance_request.unit
    }

    resources = []

    for item in inventory:

        # Only consider the specific resource requested.
        if normalize(item.name) != normalize(assistance_request.resource):
            continue

        # Conservatively preserve the configured minimum stock.
        available = max(
            0,
            item.quantity - item.minimum
        )

        resources.append({
            "id": item.id,
            "category": item.category,
            "county": item.county,
            "available": available,
            "unit": item.unit
        })

    # Use our existing matching service.
    matches = suggest_matches(need, resources)

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