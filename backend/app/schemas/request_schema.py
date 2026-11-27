from marshmallow import fields, validate

from app.models.assistance_request import REQUEST_STAGES, REQUEST_URGENCIES
from app.schemas import CamelSchema


class AssistanceRequestCreateSchema(CamelSchema):
    """What a beneficiary may send when submitting a request."""

    title = fields.Str(required=True, validate=[
        validate.Length(min=1, max=120),
        validate.Regexp(r"\S", error="Title cannot be blank"),
    ])
    category = fields.Str(required=True, validate=[
        validate.Length(min=1, max=80),
        validate.Regexp(r"\S", error="Category cannot be blank"),
    ])
    county = fields.Str(required=True, validate=[
        validate.Length(min=1, max=80),
        validate.Regexp(r"\S", error="County cannot be blank"),
    ])
    summary = fields.Str(required=True, validate=[
        validate.Length(min=1, max=2000),
        validate.Regexp(r"\S", error="Summary cannot be blank"),
    ])
    resource = fields.Str(required=True, validate=[
        validate.Length(min=1, max=120),
        validate.Regexp(r"\S", error="Resource cannot be blank"),
    ])
    quantity = fields.Int(required=True, strict=True, validate=validate.Range(min=1))
    unit = fields.Str(load_default="units", validate=validate.Length(min=1, max=40))
    urgency = fields.Str(load_default="Medium", validate=validate.OneOf(REQUEST_URGENCIES))
    organization_id = fields.Int(
        required=True, strict=True, validate=validate.Range(min=1)
    )


class AssistanceRequestSchema(CamelSchema):
    """What the API returns for an assistance request."""

    id = fields.Int(dump_only=True)
    reference = fields.Str(allow_none=True)
    beneficiary_id = fields.Int(dump_only=True)
    organization_id = fields.Int(allow_none=True)
    title = fields.Str()
    category = fields.Str()
    county = fields.Str()
    summary = fields.Str()
    resource = fields.Str()
    quantity = fields.Int()
    allocated = fields.Int()
    unit = fields.Str()
    urgency = fields.Str()
    stage = fields.Str(validate=validate.OneOf(REQUEST_STAGES))
    priority = fields.Str(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
