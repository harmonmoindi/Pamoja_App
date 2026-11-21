from app.extensions import db
from app.models.mixins import TimestampMixin

AUDIT_KINDS = ("request", "delivery", "pledge", "agency", "user", "safety")


class AuditLog(TimestampMixin, db.Model):
    """A recorded platform action. Shown on the admin dashboard and the audit page."""

    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    kind = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.String(500), nullable=False, default="")
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    actor_label = db.Column(db.String(160))  # used when the actor is not a user, e.g. "System"
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)

    actor = db.relationship("User")

    @property
    def actor_name(self) -> str:
        if self.actor is not None:
            return self.actor.name
        return self.actor_label or "System"