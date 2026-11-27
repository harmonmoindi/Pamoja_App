from flask import Blueprint, jsonify
from sqlalchemy import select
from app.errors import ApiError
from app.extensions import db
from app.models.assessment import Assessment
from app.models.assistance_request import AssistanceRequest
from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.schemas.assessment_schema import AssessmentCreateSchema, AssessmentSchema
from app.schemas.request_schema import AssistanceRequestSchema
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.validators import parse_body

bp = Blueprint("assessments", __name__)

def get_agency_request(request_id, user_id, lock=False):
    stmt = select(AssistanceRequest).join(Organization, AssistanceRequest.organization_id == Organization.id).where(
        AssistanceRequest.id == request_id, Organization.owner_id == user_id
    )
    if lock: stmt = stmt.with_for_update(of=AssistanceRequest)
    request = db.session.scalar(stmt)
    if request is None: raise ApiError(404, "not_found", "Assistance request not found")
    return request


def publish_request_for_donors(assistance_request: AssistanceRequest) -> None:
    """Mark the request published and ensure a donor-facing opportunity exists."""
    assistance_request.stage = "Published"
    existing = db.session.scalar(
        select(Opportunity).where(Opportunity.request_id == assistance_request.id)
    )
    if existing is not None:
        if existing.stage not in ("Published", "Pledged"):
            existing.stage = "Published"
        return

    db.session.add(
        Opportunity(
            title=assistance_request.title,
            category=assistance_request.category,
            county=assistance_request.county,
            description=assistance_request.summary,
            urgency=assistance_request.urgency,
            target_qty=assistance_request.quantity,
            pledged_qty=0,
            stage="Published",
            organization_id=assistance_request.organization_id,
            request_id=assistance_request.id,
        )
    )

@bp.post("/api/requests/<int:request_id>/assessment")
@role_required("agency")
def create_assessment(request_id):
    user = get_current_user()
    request = get_agency_request(request_id, user.id, lock=True)
    data = parse_body(AssessmentCreateSchema())

    existing = db.session.scalar(select(Assessment).where(Assessment.request_id == request_id))
    if existing: raise ApiError(409, "already_assessed", "This request has already been assessed")
    if request.stage != "Need identified":
        raise ApiError(409, "invalid_request_stage", "This request is not awaiting assessment")

    assessment = Assessment(request_id=request_id, assessor_id=user.id, outcome=data["outcome"], priority=data["priority"], notes=data.get("notes"))
    db.session.add(assessment)

    if data["outcome"] == "approved":
        request.priority = data["priority"]
        publish_request_for_donors(request)

    db.session.commit()
    return jsonify({"assessment": AssessmentSchema().dump(assessment)}), 201

@bp.get("/api/requests/<int:request_id>/assessment")
@role_required("agency")
def get_assessment(request_id):
    user = get_current_user()
    get_agency_request(request_id, user.id)
    assessment = db.session.scalar(select(Assessment).where(Assessment.request_id == request_id))
    return jsonify({"assessment": AssessmentSchema().dump(assessment) if assessment else None})

@bp.patch("/api/requests/<int:request_id>/assessment")
@role_required("agency")
def update_assessment(request_id):
    user = get_current_user()
    request = get_agency_request(request_id, user.id, lock=True)
    data = parse_body(AssessmentCreateSchema())
    assessment = db.session.scalar(select(Assessment).where(Assessment.request_id == request_id))

    if assessment is None: raise ApiError(404, "not_found", "Assessment not found")
    if assessment.outcome != "needs_info":
        raise ApiError(409, "assessment_finalized", "This assessment has already been finalized")
    if request.stage != "Need identified":
        raise ApiError(409, "invalid_request_stage", "This request cannot be reassessed")

    assessment.outcome = data["outcome"]
    assessment.priority = data["priority"]
    assessment.notes = data.get("notes")
    assessment.assessor_id = user.id

    if data["outcome"] == "approved":
        request.priority = data["priority"]
        publish_request_for_donors(request)

    db.session.commit()
    return jsonify({"assessment": AssessmentSchema().dump(assessment)})

@bp.get("/api/requests")
@role_required("agency")
def list_agency_requests():
    user = get_current_user()
    stmt = select(AssistanceRequest).join(Organization, AssistanceRequest.organization_id == Organization.id).where(
        Organization.owner_id == user.id
    ).order_by(AssistanceRequest.created_at.desc())
    return jsonify(paginate(stmt, AssistanceRequestSchema()))