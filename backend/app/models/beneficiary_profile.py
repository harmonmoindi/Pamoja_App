from app.extensions import db
from app.models.mixins import TimestampMixin

# Stored in privacy_settings. A missing key falls back to the value here.
DEFAULT_PRIVACY_SETTINGS = {
    "show_name": False,
    "share_location": False,
    "allow_contact": False,
}


def default_privacy_settings():
    return dict(DEFAULT_PRIVACY_SETTINGS)


class BeneficiaryProfile(TimestampMixin, db.Model):
    """Location and privacy choices for one beneficiary. One row per user."""

    __tablename__ = "beneficiary_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    county = db.Column(db.String(80))
    sub_county = db.Column(db.String(80))
    privacy_settings = db.Column(db.JSON, nullable=False, default=default_privacy_settings)

    user = db.relationship(
        "User",
        backref=db.backref("beneficiary_profile", uselist=False),
    )

    def resolved_privacy(self) -> dict:
        stored = self.privacy_settings or {}
        return {**DEFAULT_PRIVACY_SETTINGS, **stored}

    def __repr__(self) -> str:
        return f"<BeneficiaryProfile user_id={self.user_id} {self.county}>"
