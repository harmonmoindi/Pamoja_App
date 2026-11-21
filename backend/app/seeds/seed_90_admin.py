"""Audit log entries for the admin dashboard (same events as the front-end mock data)."""
from datetime import datetime

from sqlalchemy import select

from app.extensions import db
from app.models.audit_log import AuditLog
from app.models.user import User

# kind, title, description, actor name, timestamp
EVENTS = [
    ("delivery", "Resource receipt recorded", "40 medical kits received for PAM-REQ-1025", "Faith Achieng", "2026-11-18T08:48:00"),
    ("request", "Request approved", "Learning support request approved by J. Mutua", "Daniel Mutua", "2026-11-18T07:55:00"),
    ("delivery", "Delivery confirmed", "Beneficiary confirmed complete receipt for DEL-0892", "Joseph Lokiru", "2026-11-18T05:50:00"),
    ("pledge", "New donor pledge", "200 exercise books committed to Turkana schools", "Amina Hassan", "2026-11-17T16:20:00"),
    ("agency", "Agency information updated", "Lake Region Relief Network resubmitted details for re-review", "Lake Region Relief Network", "2026-11-17T11:05:00"),
    ("safety", "Possible duplicate flagged", "PAM-REQ-1042 and PAM-REQ-1045 share three signals", "System", "2026-11-16T14:30:00"),
    ("user", "Account suspended", "Donor account suspended pending review", "Pamoja Admin", "2026-10-29T09:10:00"),
    ("agency", "Agency verified", "Garissa Community Support Trust approved", "Pamoja Admin", "2026-09-19T13:40:00"),
]


def run():
    if db.session.scalar(select(AuditLog).limit(1)):
        return  # already seeded

    for kind, title, description, actor_name, when in EVENTS:
        actor = db.session.scalar(select(User).where(User.name == actor_name))
        db.session.add(AuditLog(
            kind=kind, title=title, description=description,
            actor_id=actor.id if actor else None,
            actor_label=None if actor else actor_name,
            created_at=datetime.fromisoformat(when),
        ))
