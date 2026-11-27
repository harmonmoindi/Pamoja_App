from flask import Blueprint, jsonify
from sqlalchemy import select, update

from app.errors import ApiError
from app.extensions import db
from app.models.mixins import utcnow
from app.models.notification import Notification
from app.schemas.notification_schema import NotificationSchema
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate

bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


def _get_own_notification(notification_id: int, user_id: int) -> Notification:
    note = db.session.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    if note is None:
        raise ApiError(404, "not_found", "Notification not found")
    return note


@bp.get("")
@role_required("beneficiary", "agency", "donor", "admin")
def list_notifications():
    """The logged-in user's notifications, newest first."""
    user = get_current_user()
    stmt = (
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
    )
    return jsonify(paginate(stmt, NotificationSchema()))


@bp.patch("/<int:notification_id>/read")
@role_required("beneficiary", "agency", "donor", "admin")
def mark_read(notification_id):
    """Mark one of the user's notifications as read."""
    user = get_current_user()
    note = _get_own_notification(notification_id, user.id)
    note.is_read = True
    db.session.commit()
    return jsonify({"notification": NotificationSchema().dump(note)})


@bp.patch("/read-all")
@role_required("beneficiary", "agency", "donor", "admin")
def mark_all_read():
    """Mark every unread notification for the logged-in user as read."""
    user = get_current_user()
    result = db.session.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.is_read.is_(False))
        .values(is_read=True, updated_at=utcnow())
    )
    db.session.commit()
    return jsonify({"updated": result.rowcount})
