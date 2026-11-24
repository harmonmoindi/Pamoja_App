from app.extensions import db
from app.models.mixins import TimestampMixin


APPOINTMENT_STATUSES = (
    "pending",
    "confirmed",
    "cancelled",
    "completed",
)


class Appointment(TimestampMixin, db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)

    centre_id = db.Column(
        db.Integer,
        db.ForeignKey("collection_centres.id"),
        nullable=False,
        index=True,
    )

    donor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    slot_start = db.Column(
        db.DateTime,
        nullable=False,
        index=True,
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="pending",
        index=True,
    )

    centre = db.relationship(
        "CollectionCentre",
        back_populates="appointments",
    )

    donor = db.relationship(
        "User",
        backref=db.backref("appointments", lazy=True),
    )

    def __repr__(self):
        return f"<Appointment {self.id}: {self.status}>"
