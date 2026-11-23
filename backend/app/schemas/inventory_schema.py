from marshmallow import fields, validate

from app.schemas import CamelSchema


class InventoryItemSchema(CamelSchema):
    id = fields.Int(dump_only=True)
    reference = fields.Str(allow_none=True)
    organization_id = fields.Int()
    name = fields.Str()
    category = fields.Str()
    county = fields.Str()
    quantity = fields.Int()
    unit = fields.Str()
    minimum = fields.Int()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class InventoryItemCreateSchema(CamelSchema):
    name = fields.Str(required=True, validate=[
        validate.Length(min=1, max=120),
        validate.Regexp(r"\S", error="Name cannot be blank"),
    ])
    category = fields.Str(required=True, validate=[
        validate.Length(min=1, max=80),
        validate.Regexp(r"\S", error="Category cannot be blank"),
    ])
    county = fields.Str(required=True, validate=[
        validate.Length(min=1, max=80),
        validate.Regexp(r"\S", error="County cannot be blank"),
    ])
    quantity = fields.Int(required=True, strict=True, validate=validate.Range(min=0))
    unit = fields.Str(load_default="units", validate=validate.Length(min=1, max=40))
    minimum = fields.Int(load_default=0, strict=True, validate=validate.Range(min=0))
