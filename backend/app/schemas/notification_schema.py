from marshmallow import fields

from app.schemas import CamelSchema


class NotificationSchema(CamelSchema):
    id = fields.Int()
    title = fields.Str()
    body = fields.Str()
    kind = fields.Str()
    is_read = fields.Bool()
    created_at = fields.DateTime()
