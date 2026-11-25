from app.extensions import db
from app.models.mixins import TimestampMixin

# Same spelling as the agency task board.
TASK_STATUSES = ("To Do", "In Progress", "Completed")


class Task(TimestampMixin, db.Model):
    """Work assigned inside an agency, optionally tied to an assistance request."""

    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(
        db.Integer, db.ForeignKey("organizations.id"), nullable=False, index=True
    )
    assignee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    request_id = db.Column(
        db.Integer, db.ForeignKey("assistance_requests.id"), nullable=True, index=True
    )
    title = db.Column(db.String(160), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="To Do")
    due_date = db.Column(db.Date, nullable=True)

    organization = db.relationship("Organization")
    assignee = db.relationship("User")
    request = db.relationship("AssistanceRequest")

    def __repr__(self) -> str:
        return f"<Task {self.id} - {self.status}>"
