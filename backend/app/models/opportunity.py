from app.extensions import db
from app.models.mixins import TimestampMixin


OPPORTUNITY_STAGES = (
    "Need identified",
    "Assessed",
    "Published",
    "Pledged",
    "Allocated",
    "Delivered",
    "Confirmed",
)

OPPORTUNITY_URGENCIES = (
    "Low",
    "Medium",
    "High",
    "Critical",
)

OPPORTUNITY_CATEGORIES = (
    "Food",
    "Water",
    "Shelter",
    "Medical",
    "Education",
    "Clothing",
    "Other",
)


class Opportunity(TimestampMixin, db.Model):
    __tablename__ = "opportunities"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    county = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)

    urgency = db.Column(
        db.String(20),
        nullable=False,
        default="Medium",
    )

    target_qty = db.Column(
        db.Numeric(12, 2),
        nullable=False,
        default=0,
    )

    pledged_qty = db.Column(
        db.Numeric(12, 2),
        nullable=False,
        default=0,
    )

    stage = db.Column(
        db.String(30),
        nullable=False,
        default="Published",
        index=True,
    )

    organization_id = db.Column(
        db.Integer,
        db.ForeignKey("organizations.id"),
        nullable=True,
        index=True,
    )

    request_id = db.Column(
        db.Integer,
        db.ForeignKey("assistance_requests.id"),
        nullable=True,
        unique=True,
        index=True,
    )

    organization = db.relationship(
        "Organization",
        backref=db.backref("opportunities", lazy=True),
    )

    assistance_request = db.relationship(
        "AssistanceRequest",
        backref=db.backref("opportunity", uselist=False),
    )

    pledges = db.relationship(
        "Pledge",
        back_populates="opportunity",
        lazy=True,
    )

    donations = db.relationship(
        "Donation",
        back_populates="opportunity",
        lazy=True,
    )

    def __repr__(self):
        return f"<Opportunity {self.id}: {self.title}>"
