from app.extensions import db
from app.models.mixins import TimestampMixin, utcnow

VERIFICATION_STATUSES = ("pending", "re-review", "more-info", "verified")


class Organization(TimestampMixin, db.Model):
    """A humanitarian agency. Agencies register as 'pending' and an admin verifies them."""

    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    categories = db.Column(db.JSON, nullable=False, default=list)
    counties = db.Column(db.JSON, nullable=False, default=list)
    verification_status = db.Column(db.String(20), nullable=False, default="pending")
    note = db.Column(db.String(255))
    submitted_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    owner = db.relationship("User", back_populates="organizations")

    def __repr__(self) -> str:
        return f"<Organization {self.name} ({self.verification_status})>"