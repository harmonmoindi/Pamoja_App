from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from app.schemas.request_schema import AssistanceRequestCreateSchema, AssistanceRequestSchema
from app.services import audit_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.reference_ids import make_reference
from app.utils.validators import parse_body

bp = Blueprint("requests", __name__, url_prefix="/api/requests")


def _get_own_request(request_id: int, beneficiary_id: int) -> AssistanceRequest:
    assistance_request = db.session.scalar(
        select(AssistanceRequest).where(
            AssistanceRequest.id == request_id,
            AssistanceRequest.beneficiary_id == beneficiary_id,
        )
    )
    if assistance_request is None:
        raise ApiError(404, "not_found", "Assistance request not found")
    return assistance_request


@bp.post("")
@role_required("beneficiary")
def create_request():
    beneficiary = get_current_user()
    data = parse_body(AssistanceRequestCreateSchema())

    organization_id = data.get("organization_id")
    if organization_id is not None:
        organization = db.session.get(Organization, organization_id)
        if organization is None:
            raise ApiError(404, "not_found", "Organization not found")

    assistance_request = AssistanceRequest(
        beneficiary_id=beneficiary.id,
        organization_id=organization_id,
        title=data["title"].strip(),
        category=data["category"].strip(),
        county=data["county"].strip(),
        summary=data["summary"].strip(),
        resource=data["resource"].strip(),
        quantity=data["quantity"],
        allocated=0,
        unit=data.get("unit") or "units",
        urgency=data["urgency"],
        stage="Need identified",
        priority=None,
    )
    db.session.add(assistance_request)
    db.session.flush()
    assistance_request.reference = make_reference("REQ", assistance_request.id)

    audit_service.log_event(
        "request",
        "Assistance request submitted",
        f"{assistance_request.reference}: {assistance_request.title}",
        actor=beneficiary,
        entity_type="assistance_request",
        entity_id=assistance_request.id,
        commit=False,
    )
    db.session.commit()

    return jsonify({"request": AssistanceRequestSchema().dump(assistance_request)}), 201


@bp.get("/mine")
@role_required("beneficiary")
def my_requests():
    beneficiary = get_current_user()
    stmt = (
        select(AssistanceRequest)
        .where(AssistanceRequest.beneficiary_id == beneficiary.id)
        .order_by(AssistanceRequest.created_at.desc())
    )
    return jsonify(paginate(stmt, AssistanceRequestSchema()))


@bp.get("/<int:request_id>")
@role_required("beneficiary")
def get_request(request_id):
    beneficiary = get_current_user()
    assistance_request = _get_own_request(request_id, beneficiary.id)
    return jsonify({"request": AssistanceRequestSchema().dump(assistance_request)})
