
from flask import Blueprint, jsonify, request
from sqlalchemy import or_, select

from app.errors import ApiError
from app.extensions import db
from app.models.opportunity import Opportunity
from app.schemas.opportunity_schema import OpportunitySchema
from app.utils.pagination import paginate
from app.utils.decorators import login_required


bp = Blueprint(
    "opportunities",
    __name__,
    url_prefix="/api/opportunities",
)


@bp.get("")
@login_required
def list_opportunities():
    """List published opportunities with optional filters."""

    stmt = select(Opportunity).where(
        Opportunity.stage.in_(("Published", "Pledged"))
    )

    category = request.args.get("category")
    county = request.args.get("county")
    urgency = request.args.get("urgency")
    search = request.args.get("search")

    if category:
        stmt = stmt.where(Opportunity.category.ilike(category))

    if county:
        stmt = stmt.where(Opportunity.county.ilike(county))

    if urgency:
        stmt = stmt.where(Opportunity.urgency.ilike(urgency))

    if search:
        search_term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Opportunity.title.ilike(search_term),
                Opportunity.description.ilike(search_term),
                Opportunity.county.ilike(search_term),
            )
        )

    stmt = stmt.order_by(Opportunity.created_at.desc())

    return jsonify(
        paginate(stmt, OpportunitySchema())
    )


@bp.get("/<int:opportunity_id>")
@login_required
def get_opportunity(opportunity_id):
    """Get one published opportunity."""

    opportunity = db.session.scalar(
        select(Opportunity).where(
            Opportunity.id == opportunity_id,
            Opportunity.stage.in_(("Published", "Pledged")),
        )
    )

    if opportunity is None:
        raise ApiError(
            404,
            "not_found",
            "Opportunity not found",
        )

    return jsonify({
        "opportunity": OpportunitySchema().dump(opportunity)
    })
