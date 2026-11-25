
from flask import Blueprint, jsonify
from marshmallow import ValidationError, fields

from app.errors import ApiError
from app.extensions import db
from app.models.donor_profile import DonorProfile
from app.schemas import CamelSchema
from app.utils.decorators import get_current_user, role_required


bp = Blueprint(
    "donor",
    __name__,
    url_prefix="/api/donor",
)


class DonorPreferencesSchema(CamelSchema):
    preferences = fields.Dict(
        required=False,
    )

    notification_settings = fields.Dict(
        required=False,
    )


@bp.get("/preferences")
@role_required("donor")
def get_preferences():
    """Get the logged-in donor's preferences."""

    donor = get_current_user()

    profile = db.session.scalar(
        db.select(DonorProfile).where(
            DonorProfile.user_id == donor.id
        )
    )

    if profile is None:
        profile = DonorProfile(
            user_id=donor.id,
            preferences={},
            notification_settings={},
        )

        db.session.add(profile)
        db.session.commit()

    return jsonify({
        "preferences": profile.preferences,
        "notificationSettings": profile.notification_settings,
    })


@bp.patch("/preferences")
@role_required("donor")
def update_preferences():
    """Update the logged-in donor's preferences."""

    donor = get_current_user()

    data = DonorPreferencesSchema().load(
        __import__("flask").request.get_json(silent=True) or {}
    )

    if not data:
        raise ApiError(
            400,
            "empty_preferences",
            "Provide at least one preference to update",
        )

    profile = db.session.scalar(
        db.select(DonorProfile).where(
            DonorProfile.user_id == donor.id
        )
    )

    if profile is None:
        profile = DonorProfile(
            user_id=donor.id,
            preferences={},
            notification_settings={},
        )

        db.session.add(profile)

    if "preferences" in data:
        profile.preferences = data["preferences"]

    if "notification_settings" in data:
        profile.notification_settings = data[
            "notification_settings"
        ]

    db.session.commit()

    return jsonify({
        "message": "Preferences updated successfully",
        "preferences": profile.preferences,
        "notificationSettings": profile.notification_settings,
    })
