from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.assessment import Assessment
from app.models.organization import Organization
from app.schemas.assessment_schema import AssessmentCreateSchema, AssessmentSchema
from app.utils.decorators import get_current_user, role_required
from app.utils.validators import parse_body

bp = Blueprint("assessments", __name__)


@bp.post("/api/requests/<int:request_id>/assessment")
@role_required("agency")
def create_assessment(request_id):
    from app.models.assistance_request import AssistanceRequest

    user = get_current_user()
    assistance_request = db.session.get(AssistanceRequest, request_id)

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

    data = parse_body(AssessmentCreateSchema())

    allowed_outcomes = {"approved", "rejected", "needs_info"}

    if data["outcome"] not in allowed_outcomes:
        raise ApiError(
            400,
            "validation_error",
            "Invalid assessment outcome"
        )

    existing = db.session.scalar(
        select(Assessment).where(
            Assessment.request_id == request_id
        )
    )

    if existing is not None:
        raise ApiError(
            409,
            "already_assessed",
            "This request has already been assessed"
        )

    assessment = Assessment(
        request_id=request_id,
        assessor_id=user.id,
        outcome=data["outcome"],
        priority=data["priority"],
        notes=data.get("notes")
    )

    db.session.add(assessment)

    if data["outcome"] == "approved":
        assistance_request.stage = "Assessed"
        assistance_request.priority = data["priority"]

    db.session.commit()

    return jsonify({
        "assessment": AssessmentSchema().dump(assessment)
    }), 201