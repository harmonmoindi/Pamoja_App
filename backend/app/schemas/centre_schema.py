from marshmallow import fields  # pyright: ignore[reportMissingImports]

from app.schemas import CamelSchema


class CentreSchema(CamelSchema):
    id = fields.Integer(dump_only=True)

    name = fields.String(dump_only=True)

    county = fields.String(dump_only=True)

    general_area = fields.String(dump_only=True)

    opening_hours = fields.Dict(
        keys=fields.String(),
        values=fields.Raw(),
        dump_only=True,
    )

    categories = fields.List(
        fields.String(),
        dump_only=True,
    )

    organization_id = fields.Integer(
        dump_only=True,
        allow_none=True,
    )
