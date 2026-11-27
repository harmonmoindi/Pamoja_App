from decimal import Decimal

from flask import Blueprint, jsonify, request
from sqlalchemy import or_, select

from app.errors import ApiError
from app.extensions import db
from app.models.assessment import Assessment
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from app.schemas.opportunity_schema import OpportunitySchema
from app.services import audit_service
from app.utils.decorators import (
    get_current_user,
    login_required,
    role_required,
)
from app.utils.pagination import paginate


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
        stmt = stmt.where(
            Opportunity.category.ilike(category)
        )

    if county:
        stmt = stmt.where(
            Opportunity.county.ilike(county)
        )

    if urgency:
        stmt = stmt.where(
            Opportunity.urgency.ilike(urgency)
        )

    if search:
        search_term = f"%{search.strip()}%"

        stmt = stmt.where(
            or_(
                Opportunity.title.ilike(search_term),
                Opportunity.description.ilike(search_term),
                Opportunity.county.ilike(search_term),
            )
        )

    stmt = stmt.order_by(
        Opportunity.created_at.desc()
    )

    return jsonify(
        paginate(stmt, OpportunitySchema())
    )


@bp.get("/<int:opportunity_id>")
@login_required
def get_opportunity(opportunity_id):
    """Retrieve one published opportunity."""

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


@bp.post("/from-request/<int:request_id>")
@role_required("agency")
def publish_request_as_opportunity(request_id):
    """Publish an approved agency request for donors."""

    agency = get_current_user()

    # Only retrieve requests assigned to this agency.
    assistance_request = db.session.scalar(
        select(AssistanceRequest)
        .join(
            Organization,
            AssistanceRequest.organization_id == Organization.id,
        )
        .where(
            AssistanceRequest.id == request_id,
            Organization.owner_id == agency.id,
        )
        .with_for_update(of=AssistanceRequest)
    )

    if assistance_request is None:
        raise ApiError(
            404,
            "not_found",
            "Assistance request not found",
        )

    # Prevent duplicate opportunities.
    existing_opportunity = db.session.scalar(
        select(Opportunity).where(
            Opportunity.request_id == request_id
        )
    )

    if existing_opportunity is not None:
        raise ApiError(
            409,
            "already_published",
            "This request already has a donor opportunity",
        )

    # Requests must be assessed before publication.
    if assistance_request.stage != "Assessed":
        raise ApiError(
            409,
            "invalid_request_stage",
            "Only assessed requests can be published",
        )

    # Verify that the assessment was approved.
    assessment = db.session.scalar(
        select(Assessment).where(
            Assessment.request_id == request_id
        )
    )

    if assessment is None or assessment.outcome != "approved":
        raise ApiError(
            409,
            "assessment_not_approved",
            "The assistance request must be approved",
        )

    remaining_quantity = (
        assistance_request.quantity
        - assistance_request.allocated
    )

    if remaining_quantity <= 0:
        raise ApiError(
            409,
            "request_fulfilled",
            "This request has no outstanding resource requirement",
        )

    # Publish a general description without personal details.
    opportunity_title = (
        f"{assistance_request.category} Support "
        f"in {assistance_request.county}"
    )

    opportunity_description = (
        f"Support an approved humanitarian need "
        f"in {assistance_request.county}. "
        f"The agency requires {remaining_quantity} "
        f"{assistance_request.unit} of "
        f"{assistance_request.resource}."
    )

    opportunity = Opportunity(
        title=opportunity_title,
        description=opportunity_description,
        category=assistance_request.category,
        county=assistance_request.county,
        urgency=assistance_request.urgency,
        target_qty=Decimal(str(remaining_quantity)),
        pledged_qty=Decimal("0"),
        stage="Published",
        organization_id=assistance_request.organization_id,
        request_id=assistance_request.id,
    )

    db.session.add(opportunity)

    # Update the beneficiary request lifecycle.
    assistance_request.stage = "Published"

    db.session.flush()

    audit_service.log_event(
        "opportunity",
        "Opportunity published",
        (
            f"Request {assistance_request.reference or request_id} "
            f"published as opportunity {opportunity.id}"
        ),
        actor=agency,
        entity_type="opportunity",
        entity_id=opportunity.id,
        commit=False,
    )

    db.session.commit()

    return jsonify({
        "message": "Opportunity published successfully",
        "opportunity": OpportunitySchema().dump(opportunity),
    }), 201