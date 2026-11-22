from app.extensions import db
from app.models.mixins import TimestampMixin

class Assessment(TimestampMixin, db.Model):
    __tablename__ = "assessments"

    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey("assistance_requests.id"), nullable=False, index=True)
    assessor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    outcome = db.Column(db.String(30), nullable=False)
    priority = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Assessment {self.id} - Request {self.request_id}>"