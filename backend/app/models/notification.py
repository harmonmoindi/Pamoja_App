from app.extensions import db
from app.models.mixins import TimestampMixin


class Notification(TimestampMixin, db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(160), nullable=False)
    body = db.Column(db.Text, nullable=False, default="")
    kind = db.Column(db.String(30), nullable=False, default="info")
    is_read = db.Column(db.Boolean, nullable=False, default=False)

    user = db.relationship("User")
