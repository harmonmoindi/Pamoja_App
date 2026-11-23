from app.extensions import db
from app.models.mixins import TimestampMixin

# Platform lifecycle (admin oversight + agency assessment). Keep spelling identical everywhere.
REQUEST_STAGES = (
    "Need identified",
    "Assessed",
    "Published",
    "Pledged",
    "Allocated",
    "Delivered",
    "Confirmed",
)

# Beneficiary-facing urgency on submit. Agency sets `priority` later during assessment.
REQUEST_URGENCIES = ("Low", "Medium", "High")


class AssistanceRequest(TimestampMixin, db.Model):
    """A beneficiary's request for humanitarian assistance."""

    __tablename__ = "assistance_requests"

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(30), unique=True, index=True)
    beneficiary_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=True, index=True)

    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    county = db.Column(db.String(80), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    resource = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    allocated = db.Column(db.Integer, nullable=False, default=0)
    unit = db.Column(db.String(40), nullable=False, default="units")
    urgency = db.Column(db.String(20), nullable=False, default="Medium")
    stage = db.Column(db.String(30), nullable=False, default="Need identified")
    priority = db.Column(db.String(30), nullable=True)

    def __repr__(self) -> str:
        return f"<AssistanceRequest {self.reference} - {self.stage}>"
