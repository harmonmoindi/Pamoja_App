from app.extensions import db
from app.models.mixins import TimestampMixin

RECEIPT_OUTCOMES = ("complete", "partial", "not_received", "discrepancy")


class ReceiptConfirmation(TimestampMixin, db.Model):
    """Beneficiary confirmation that a delivery arrived (or a discrepancy report)."""

    __tablename__ = "receipt_confirmations"

    id = db.Column(db.Integer, primary_key=True)
    delivery_id = db.Column(db.Integer, db.ForeignKey("deliveries.id"), nullable=False, unique=True, index=True)
    request_id = db.Column(db.Integer, db.ForeignKey("assistance_requests.id"), nullable=False, index=True)
    beneficiary_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    outcome = db.Column(db.String(30), nullable=False)
    comments = db.Column(db.Text, nullable=True)

    def __repr__(self) -> str:
        return f"<ReceiptConfirmation delivery={self.delivery_id} - {self.outcome}>"
