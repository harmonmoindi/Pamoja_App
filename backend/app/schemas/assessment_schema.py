from marshmallow import fields, validate
from app.schemas import CamelSchema

class AssessmentCreateSchema(CamelSchema):
    outcome = fields.Str(required=True, validate=[
        validate.Length(min=1, max=30),
        validate.Regexp(r"\S", error="Outcome cannot be blank")
    ])
    priority = fields.Str(required=True, validate=[
        validate.Length(min=1, max=20),
        validate.Regexp(r"\S", error="Priority cannot be blank")
    ])
    notes = fields.Str(load_default=None, allow_none=True, validate=validate.Length(max=2000))

class AssessmentSchema(CamelSchema):
    id = fields.Int(dump_only=True)
    request_id = fields.Int(dump_only=True)
    assessor_id = fields.Int(dump_only=True)
    outcome = fields.Str()
    priority = fields.Str()
    notes = fields.Str(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()