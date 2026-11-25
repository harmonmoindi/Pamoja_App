from app.extensions import db
from app.models.mixins import TimestampMixin


class DonorProfile(TimestampMixin, db.Model):
    __tablename__ = "donor_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    preferences = db.Column(
        db.JSON,
        nullable=False,
        default=dict,
    )

    notification_settings = db.Column(
        db.JSON,
        nullable=False,
        default=dict,
    )

    user = db.relationship(
        "User",
        backref=db.backref(
            "donor_profile",
            uselist=False,
            lazy=True,
        ),
    )

    def __repr__(self):
        return f"<DonorProfile user={self.user_id}>"
