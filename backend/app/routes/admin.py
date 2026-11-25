from flask import Blueprint, jsonify, request
from sqlalchemy import func, or_, select

from app.errors import ApiError
from app.extensions import db
from app.models.audit_log import AUDIT_KINDS, AuditLog
from app.models.mixins import utcnow
from app.models.organization import VERIFICATION_STATUSES, Organization
from app.models.user import User
from app.models.duplicate_flag import DuplicateFlag
from app.schemas.admin_schema import (
    AdminAgencySchema,
    AgencyDecisionSchema,
    AgencyUpdateSchema,
    AuditEventSchema,
)
from app.services import audit_service, notification_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.validators import parse_body

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _get_agency(org_id: int) -> Organization:
    org = db.session.get(Organization, org_id)
    if org is None:
        raise ApiError(404, "not_found", "Agency not found")
    return org


# ---------------------------------------------------------------- agency verification
@bp.get("/agencies")
@role_required("admin")
def list_agencies():
    """Filters: ?q=name  ?status=pending|re-review|more-info|verified   plus ?page= and ?perPage="""
    stmt = select(Organization).order_by(Organization.submitted_at.desc())

    q = request.args.get("q", "").strip()
    if q:
        stmt = stmt.where(db.func.lower(Organization.name).like(f"%{q.lower()}%"))
    status = request.args.get("status")
    if status in VERIFICATION_STATUSES:
        stmt = stmt.where(Organization.verification_status == status)

    return jsonify(paginate(stmt, AdminAgencySchema()))


@bp.get("/agencies/<int:org_id>")
@role_required("admin")
def get_agency(org_id):
    return jsonify({"agency": AdminAgencySchema().dump(_get_agency(org_id))})


@bp.patch("/agencies/<int:org_id>")
@role_required("admin")
def update_agency(org_id):
    """Saves the review checklist and/or the private admin notes.
    Body: { "checklist": [{ "label": "...", "done": true }, ... 4 items], "adminNotes": "..." }"""
    org = _get_agency(org_id)
    if org.verification_status == "verified":
        raise ApiError(409, "already_verified", "A verified agency can no longer be edited here")

    data = parse_body(AgencyUpdateSchema())
    if "checklist" in data:
        org.checklist = data["checklist"]  # assigning a new list is what makes SQLAlchemy save it
    if "admin_notes" in data:
        org.admin_notes = data["admin_notes"]
    db.session.commit()
    return jsonify({"agency": AdminAgencySchema().dump(org)})


@bp.post("/agencies/<int:org_id>/decision")
@role_required("admin")
def decide_agency(org_id):
    """Body: { "decision": "approve" | "request-info", "adminNotes": "..." }
    Approving needs every checklist item ticked."""
    admin = get_current_user()
    org = _get_agency(org_id)
    if org.verification_status == "verified":
        raise ApiError(409, "already_verified", "This agency is already verified")

    data = parse_body(AgencyDecisionSchema())
    approving = data["decision"] == "approve"
    if approving and not all(item["done"] for item in org.checklist_items()):
        raise ApiError(400, "checklist_incomplete", "Complete every checklist item before approving")

    # Everything is validated, so it is safe to change the agency now.
    if data.get("admin_notes") is not None:
        org.admin_notes = data["admin_notes"]
    org.reviewed_by_id = admin.id
    org.reviewed_at = utcnow()

    if approving:
        org.verification_status = "verified"
        org.note = None
        if org.owner is not None and org.owner.status == "pending":
            org.owner.status = "active"
        title, message = "Agency verified", f"{org.name} approved"
        owner_title, owner_body = "Your organization is verified", f"{org.name} is now a verified agency."
    else:
        org.verification_status = "more-info"
        org.note = "Information requested"
        title, message = "Information requested", f"More information requested from {org.name}"
        owner_title, owner_body = "More information needed", f"An administrator needs more information about {org.name}."

    audit_service.log_event("agency", title, message, actor=admin, entity_type="organization", entity_id=org.id, commit=False)
    if org.owner_id:
        notification_service.notify(org.owner_id, owner_title, owner_body, kind="agency", commit=False)
    db.session.commit()
    return jsonify({"agency": AdminAgencySchema().dump(org)})


# ---------------------------------------------------------------- audit log
@bp.get("/audit")
@role_required("admin")
def list_audit():
    """Filters: ?q=text (title, description or person)  ?kind=request|delivery|pledge|agency|user|safety"""
    stmt = select(AuditLog).outerjoin(AuditLog.actor).order_by(AuditLog.created_at.desc(), AuditLog.id.desc())

    q = request.args.get("q", "").strip().lower()
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                db.func.lower(AuditLog.title).like(like),
                db.func.lower(AuditLog.description).like(like),
                db.func.lower(User.name).like(like),
                db.func.lower(AuditLog.actor_label).like(like),
            )
        )
    kind = request.args.get("kind")
    if kind in AUDIT_KINDS:
        stmt = stmt.where(AuditLog.kind == kind)

    return jsonify(paginate(stmt, AuditEventSchema()))


# ---------------------------------------------------------------- dashboard numbers
@bp.get("/overview")
@role_required("admin")
def overview():
    """Headline numbers for the admin dashboard.
    flaggedRecords is 0 until the duplicate-review feature adds its table."""
    now = utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_users = db.session.scalar(select(func.count(User.id))) or 0
    new_users = db.session.scalar(select(func.count(User.id)).where(User.created_at >= month_start)) or 0
    awaiting = db.session.scalar(
        select(func.count(Organization.id)).where(Organization.verification_status != "verified")
    ) or 0
    verified_orgs = db.session.scalars(select(Organization).where(Organization.verification_status == "verified")).all()
    counties = {county for org in verified_orgs for county in (org.counties or [])}
    flagged = db.session.scalar(
    select(func.count(DuplicateFlag.id)).where(DuplicateFlag.status == "needs-review")
    ) or 0

    return jsonify(
        {
            "metrics": [
                {"label": "Registered users", "value": f"{total_users:,}", "note": f"+{new_users} this month"},
                {"label": "Pending agencies", "value": str(awaiting), "note": "Awaiting review"},
                {"label": "Verified agencies", "value": str(len(verified_orgs)), "note": f"Across {len(counties)} counties"},
                {"label": "Flagged records", "value": str(flagged), "note": "Require assessment"},
            ],
            "trustSafety": {
                "score": max(0, 100 - 2 * flagged),
                "headline": "Platform health is stable" if flagged < 10 else "Several records need attention",
                "summary": f"{flagged} flagged records require human review.",
            },
        }
    )
