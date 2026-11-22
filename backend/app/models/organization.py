from app.extensions import db
from app.models.mixins import TimestampMixin, utcnow

VERIFICATION_STATUSES = ("pending", "re-review", "more-info", "verified")

CHECKLIST_ITEMS = (
    "Organization profile completed",
    "Registration details supplied",
    "Operating region documented",
    "Safeguarding contact supplied",
)


def default_checklist():
    return [{"label": label, "done": False} for label in CHECKLIST_ITEMS]


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

    # Admin review
    checklist = db.Column(db.JSON)  # [{"label": "...", "done": true}, ...]; empty means "nothing ticked yet"
    admin_notes = db.Column(db.Text)
    reviewed_by_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    reviewed_at = db.Column(db.DateTime)

    owner = db.relationship("User", back_populates="organizations", foreign_keys=[owner_id])
    reviewed_by = db.relationship("User", foreign_keys=[reviewed_by_id])

    def checklist_items(self):
        return self.checklist or default_checklist()

    def __repr__(self) -> str:
        return f"<Organization {self.name} ({self.verification_status})>"