from marshmallow import fields, validate

from app.schemas import CamelSchema


class AllocationCreateSchema(CamelSchema):
    request_id = fields.Int(
        required=True,
        strict=True,
        validate=validate.Range(min=1)
    )

    resource_id = fields.Int(
        required=True,
        strict=True,
        validate=validate.Range(min=1)
    )

    quantity = fields.Int(
        required=True,
        strict=True,
        validate=validate.Range(min=1)
    )