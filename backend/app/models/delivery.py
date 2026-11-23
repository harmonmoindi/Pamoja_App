from app.extensions import db
from app.models.mixins import TimestampMixin

class Delivery(TimestampMixin, db.Model):
    __tablename__ = "deliveries"

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(40), unique=True, index=True, nullable=True)
    request_id = db.Column(db.Integer, db.ForeignKey("assistance_requests.id"), nullable=False, index=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False, index=True)
    pledge_id = db.Column(db.Integer, db.ForeignKey("pledges.id"), nullable=True, index=True)
    status = db.Column(db.String(30), nullable=False, default="pending")
    dispatched_at = db.Column(db.DateTime, nullable=True)
    delivered_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"<Delivery {self.reference} - {self.status}>"