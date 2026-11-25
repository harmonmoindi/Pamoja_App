from app.extensions import db
from app.models.mixins import TimestampMixin


DONATION_STATUSES = (
    "pending",
    "processing",
    "successful",
    "failed",
)


class Donation(TimestampMixin, db.Model):
    __tablename__ = "donations"

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
        nullable=True,
        index=True,
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False,
    )

    phone = db.Column(
        db.String(20),
        nullable=False,
    )

    payment_method = db.Column(
        db.String(30),
        nullable=False,
        default="M-Pesa",
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="pending",
        index=True,
    )

    checkout_request_id = db.Column(
        db.String(100),
        nullable=True,
        unique=True,
        index=True,
    )

    merchant_request_id = db.Column(
        db.String(100),
        nullable=True,
    )

    mpesa_receipt = db.Column(
        db.String(50),
        nullable=True,
        unique=True,
    )

    result_code = db.Column(
        db.String(20),
        nullable=True,
    )

    result_description = db.Column(
        db.String(255),
        nullable=True,
    )

    is_simulated = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
    )

    donor = db.relationship(
        "User",
        backref=db.backref("donations", lazy=True),
    )

    opportunity = db.relationship(
        "Opportunity",
        back_populates="donations",
    )

    def __repr__(self):
        return f"<Donation {self.reference or self.id}: {self.status}>"
