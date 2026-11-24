from app.extensions import db
from app.models.mixins import TimestampMixin


PLEDGE_TYPES = (
    "in_kind",
    "financial",
)

PLEDGE_STATUSES = (
    "pending",
    "confirmed",
    "fulfilled",
    "cancelled",
)


class Pledge(TimestampMixin, db.Model):
    __tablename__ = "pledges"

    id = db.Column(db.Integer, primary_key=True)

    reference = db.Column(
        db.String(30),
        unique=True,
        nullable=True,
        index=True,
    )

    donor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    opportunity_id = db.Column(
        db.Integer,
        db.ForeignKey("opportunities.id"),
        nullable=False,
        index=True,
    )

    pledge_type = db.Column(
        "type",
        db.String(20),
        nullable=False,
    )

    quantity = db.Column(
        db.Integer,
        nullable=True,
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
        default=0,
    )

    description = db.Column(
        db.String(255),
        nullable=True,
    )

    payment_method = db.Column(
        db.String(30),
        nullable=True,
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="pending",
        index=True,
    )

    donor = db.relationship(
        "User",
        backref=db.backref("pledges", lazy=True),
    )

    opportunity = db.relationship(
        "Opportunity",
        back_populates="pledges",
    )

    def __repr__(self):
        return f"<Pledge {self.reference or self.id}>"
