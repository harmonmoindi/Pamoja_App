from app.extensions import db
from app.models.mixins import TimestampMixin

# Minimal stub so Delivery.pledge_id FK resolves for create_all / tests.
# Donor owns the full pledge feature (see docs/HOW_TO_ADD_A_FEATURE.MD).
PLEDGE_STATUSES = ("pending", "fulfilled", "cancelled")


class Pledge(TimestampMixin, db.Model):
    __tablename__ = "pledges"

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(30), unique=True)
    donor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    opportunity_id = db.Column(db.Integer, nullable=True, index=True)
    quantity = db.Column(db.Integer, nullable=True)
    description = db.Column(db.String(255))
    status = db.Column(db.String(20), nullable=False, default="pending")

    def __repr__(self) -> str:
        return f"<Pledge {self.reference} - {self.status}>"
