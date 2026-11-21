from datetime import datetime, timezone

from app.extensions import db


def utcnow() -> datetime:
    """Current time in UTC, without timezone info (what we store in the database)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class TimestampMixin:
    """Add to any model:  class Pledge(TimestampMixin, db.Model)"""

    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)
