from marshmallow import fields, validate
from app.schemas import CamelSchema


def required_text(max_length):
    return fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=max_length),
            validate.Regexp(r"\S", error="Field cannot be blank")
        ]
    )


class CentreCreateSchema(CamelSchema):
    name = required_text(120)
    county = required_text(80)
    general_area = required_text(160)
    opening_hours = required_text(160)
    categories = fields.List(
        required_text(80),
        required=True,
        validate=validate.Length(min=1, max=20)
    )


class CentreUpdateSchema(CentreCreateSchema):
    """Used with partial=True to update selected centre fields."""
    pass


class CentreSchema(CamelSchema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    name = fields.Str()
    county = fields.Str()
    general_area = fields.Str()
    opening_hours = fields.Str()
    categories = fields.List(fields.Str())
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)