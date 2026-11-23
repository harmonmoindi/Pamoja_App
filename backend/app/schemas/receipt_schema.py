from marshmallow import fields, validate

from app.models.receipt_confirmation import RECEIPT_OUTCOMES
from app.schemas import CamelSchema


class ReceiptCreateSchema(CamelSchema):
    delivery_id = fields.Int(required=True, strict=True, validate=validate.Range(min=1))
    outcome = fields.Str(required=True, validate=validate.OneOf(RECEIPT_OUTCOMES))
    comments = fields.Str(load_default=None, allow_none=True, validate=validate.Length(max=2000))


class ReceiptConfirmationSchema(CamelSchema):
    id = fields.Int(dump_only=True)
    delivery_id = fields.Int()
    request_id = fields.Int()
    beneficiary_id = fields.Int()
    outcome = fields.Str()
    comments = fields.Str(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
