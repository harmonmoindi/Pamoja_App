from marshmallow import fields, validate
from app.schemas import CamelSchema

class DeliveryCreateSchema(CamelSchema):
    request_id = fields.Int(required=True, strict=True, validate=validate.Range(min=1))
    pledge_id = fields.Int(load_default=None, allow_none=True, strict=True, validate=validate.Range(min=1))

class DeliveryUpdateSchema(CamelSchema):
    status = fields.Str(required=True, validate=[
        validate.Length(min=1, max=30),
        validate.Regexp(r"\S", error="Status cannot be blank")
    ])

class DeliverySchema(CamelSchema):
    id = fields.Int(dump_only=True)
    reference = fields.Str(allow_none=True)
    request_id = fields.Int()
    organization_id = fields.Int()
    pledge_id = fields.Int(allow_none=True)
    status = fields.Str()
    dispatched_at = fields.DateTime(allow_none=True)
    delivered_at = fields.DateTime(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()