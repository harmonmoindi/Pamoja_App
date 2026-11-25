from app.extensions import db
from app.models.mixins import TimestampMixin

DUPLICATE_STATUSES = ("needs-review", "separate", "escalated")


class DuplicateFlag(TimestampMixin, db.Model):
    """Two assistance requests that look alike. An admin decides; similarity alone never proves fraud."""

    __tablename__ = "duplicate_flags"

    id = db.Column(db.Integer, primary_key=True)
    # Store the pair with the smaller request id in request_a_id, so (1, 2) and (2, 1) are never saved twice.
    request_a_id = db.Column(db.Integer, db.ForeignKey("assistance_requests.id"), nullable=False, index=True)
    request_b_id = db.Column(db.Integer, db.ForeignKey("assistance_requests.id"), nullable=False, index=True)
    signals = db.Column(db.JSON, nullable=False, default=list)  # e.g. ["Same category", "Same general area"]
    status = db.Column(db.String(20), nullable=False, default="needs-review")
    decided_by_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    decided_at = db.Column(db.DateTime)

    decided_by = db.relationship("User", foreign_keys=[decided_by_id])

    __table_args__ = (db.UniqueConstraint("request_a_id", "request_b_id", name="uq_duplicate_pair"),)

    def __repr__(self) -> str:
        return f"<DuplicateFlag {self.request_a_id}-{self.request_b_id} ({self.status})>"