from app.extensions import db
from app.models.notification import Notification


def notify(user_id, title, body="", kind="info", commit=True):
    """Creates an in-app notification for a user.

    Example: notify(request.beneficiary_id, "Request approved", "Your request was approved.", kind="request")
    """
    note = Notification(user_id=user_id, title=title, body=body, kind=kind)
    db.session.add(note)
    if commit:
        db.session.commit()
    return note
