
from flask import Blueprint, jsonify, request
from sqlalchemy import select

from app.extensions import db
from app.models.collection_centre import CollectionCentre
from app.schemas.centre_schema import CentreSchema
from app.utils.decorators import login_required
from app.utils.pagination import paginate


bp = Blueprint(
    "centres",
    __name__,
    url_prefix="/api/centres",
)


@bp.get("")
@login_required
def list_centres():
    """List collection centres with optional county filtering."""

    stmt = select(CollectionCentre)

    county = request.args.get("county")
    category = request.args.get("category")

    if county:
        stmt = stmt.where(
            CollectionCentre.county.ilike(county.strip())
        )

    if category:
        stmt = stmt.where(
            CollectionCentre.categories.contains([category.strip()])
        )

    stmt = stmt.order_by(CollectionCentre.name.asc())

    return jsonify(
        paginate(stmt, CentreSchema())
    )


@bp.get("/<int:centre_id>")
@login_required
def get_centre(centre_id):
    """Get one collection centre."""

    centre = db.session.get(
        CollectionCentre,
        centre_id,
    )

    if centre is None:
        from app.errors import ApiError

        raise ApiError(
            404,
            "not_found",
            "Collection centre not found",
        )

    return jsonify({
        "centre": CentreSchema().dump(centre)
    })
