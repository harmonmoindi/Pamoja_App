from marshmallow import fields, validate

from app.models.user import USER_STATUSES
from app.schemas import CamelSchema
from app.utils.validators import validate_password


class UserSchema(CamelSchema):
    """What the API returns for a user. Matches the User type in frontend/src/types/user.ts."""

    id = fields.Int()
    name = fields.Str()
    email = fields.Str()
    role = fields.Str()
    status = fields.Str()
    county = fields.Str(allow_none=True)
    joined_on = fields.Method("get_joined_on")
    last_active_on = fields.Method("get_last_active_on")

    def get_joined_on(self, user):
        return user.created_at.date().isoformat()

    def get_last_active_on(self, user):
        return (user.last_active_at or user.created_at).date().isoformat()


class RegisterSchema(CamelSchema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate_password)
    role = fields.Str(load_default="donor", validate=validate.OneOf(("donor", "beneficiary", "agency")))
    county = fields.Str(load_default=None, allow_none=True)
    organization_name = fields.Str(load_default=None, allow_none=True)


class LoginSchema(CamelSchema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class UserStatusSchema(CamelSchema):
    status = fields.Str(required=True, validate=validate.OneOf(("active", "suspended")))