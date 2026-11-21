from flask import Blueprint, jsonify, request
from sqlalchemy import or_, select

from app.errors import ApiError
from app.extensions import db
from app.models.user import ROLES, USER_STATUSES, User
from app.schemas.user_schema import UserSchema, UserStatusSchema
from app.services import audit_service, notification_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.validators import parse_body

bp = Blueprint("users", __name__, url_prefix="/api/users")


@bp.get("")
@role_required("admin")
def list_users():
    """Admin only.  Filters: ?q=name-or-email  ?role=donor  ?status=active   plus ?page= and ?perPage="""
    stmt = select(User).order_by(User.created_at.desc())

    q = request.args.get("q", "").strip()
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(or_(db.func.lower(User.name).like(like), db.func.lower(User.email).like(like)))
    role = request.args.get("role")
    if role in ROLES:
        stmt = stmt.where(User.role == role)
    status = request.args.get("status")
    if status in USER_STATUSES:
        stmt = stmt.where(User.status == status)

    return jsonify(paginate(stmt, UserSchema()))


@bp.patch("/<int:user_id>/status")
@role_required("admin")
def update_status(user_id):
    """Admin only. Body: { "status": "active" | "suspended" }  (approve = active)."""
    admin = get_current_user()
    target = db.session.get(User, user_id)
    if target is None:
        raise ApiError(404, "not_found", "User not found")
    if target.role == "admin" or target.id == admin.id:
        raise ApiError(403, "forbidden", "Admin accounts cannot be changed here")

    status = parse_body(UserStatusSchema())["status"]
    target.status = status

    titles = {"active": "Account activated", "suspended": "Account suspended"}
    audit_service.log_event(
        "user", titles[status], f"{target.name} ({target.role}) set to {status}",
        actor=admin, entity_type="user", entity_id=target.id, commit=False,
    )
    notification_service.notify(
        target.id, titles[status],
        "Your account is now active." if status == "active" else "Your account has been suspended by an administrator.",
        kind="user", commit=False,
    )
    db.session.commit()
    return jsonify({"user": UserSchema().dump(target)})