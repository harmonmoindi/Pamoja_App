"""Admin endpoints for request oversight and duplicate review.

Kept in its own file so routes/admin.py (agencies, audit, overview) stays short.
Both files use the /api/admin prefix; each blueprint has its own name.
"""
from flask import Blueprint, jsonify, request
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import joinedload

from app.errors import ApiError
from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.audit_log import AuditLog  # noqa: F401  (keeps the audit table loaded for relationships)
from app.models.duplicate_flag import DUPLICATE_STATUSES, DuplicateFlag
from app.models.mixins import utcnow
from app.models.organization import Organization
from app.schemas.admin_schema import (
    PRIORITIES,
    URGENCY_TO_PRIORITY,
    DuplicateDecisionSchema,
    DuplicateFlagSchema,
    OversightRequestSchema,
)
from app.services import audit_service, duplicate_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.validators import parse_body

bp = Blueprint("admin_requests", __name__, url_prefix="/api/admin")

_URGENCY_FOR_PRIORITY = {label: urgency for urgency, label in URGENCY_TO_PRIORITY.items()}


def _priority_clause(label):
    """Matches requests whose assessed priority is `label`, or that have no known priority and whose urgency maps to it."""
    return or_(
        AssistanceRequest.priority == label,
        and_(
            or_(AssistanceRequest.priority.is_(None), AssistanceRequest.priority.not_in(PRIORITIES)),
            AssistanceRequest.urgency == _URGENCY_FOR_PRIORITY[label],
        ),
    )


# ---------------------------------------------------------------- request oversight
@bp.get("/requests")
@role_required("admin")
def list_requests():
    """All requests across agencies.
    Filters: ?q=reference-title-or-agency  ?stage=Published  ?priority=Urgent|High priority|Standard"""
    stmt = (
        select(AssistanceRequest)
        .options(joinedload(AssistanceRequest.organization))
        .outerjoin(Organization, AssistanceRequest.organization_id == Organization.id)
        .order_by(AssistanceRequest.updated_at.desc(), AssistanceRequest.id.desc())
    )

    q = request.args.get("q", "").strip().lower()
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                db.func.lower(AssistanceRequest.reference).like(like),
                db.func.lower(AssistanceRequest.title).like(like),
                db.func.lower(Organization.name).like(like),
            )
        )
    stage = request.args.get("stage")
    if stage:
        stmt = stmt.where(AssistanceRequest.stage == stage)
    priority = request.args.get("priority")
    if priority in PRIORITIES:
        stmt = stmt.where(_priority_clause(priority))

    return jsonify(paginate(stmt, OversightRequestSchema()))


# ---------------------------------------------------------------- duplicate review
@bp.get("/duplicates")
@role_required("admin")
def list_duplicates():
    """Filter: ?status=needs-review|separate|escalated"""
    stmt = select(DuplicateFlag).order_by(DuplicateFlag.created_at.desc(), DuplicateFlag.id.desc())
    status = request.args.get("status")
    if status in DUPLICATE_STATUSES:
        stmt = stmt.where(DuplicateFlag.status == status)
    return jsonify(paginate(stmt, DuplicateFlagSchema()))


@bp.post("/duplicates/scan")
@role_required("admin")
def scan_duplicates():
    """Compares all requests and flags similar pairs that are not flagged yet."""
    created = duplicate_service.scan_for_duplicates(actor=get_current_user())
    return jsonify({"created": created})


@bp.patch("/duplicates/<int:flag_id>")
@role_required("admin")
def decide_duplicate(flag_id):
    """Body: { "status": "separate" | "escalated" }"""
    admin = get_current_user()
    flag = db.session.get(DuplicateFlag, flag_id)
    if flag is None:
        raise ApiError(404, "not_found", "Duplicate flag not found")

    status = parse_body(DuplicateDecisionSchema())["status"]
    flag.status = status
    flag.decided_by_id = admin.id
    flag.decided_at = utcnow()

    title = "Marked as separate requests" if status == "separate" else "Duplicate escalated for assessment"
    audit_service.log_event(
        "safety", title, f"Duplicate review #{flag.id} decided: {status}",
        actor=admin, entity_type="duplicate_flag", entity_id=flag.id, commit=False,
    )
    db.session.commit()
    return jsonify({"duplicate": DuplicateFlagSchema().dump(flag)})
