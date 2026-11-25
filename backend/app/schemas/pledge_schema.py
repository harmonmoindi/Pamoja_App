from marshmallow import fields, validate

from app.schemas import CamelSchema


PLEDGE_TYPES = (
    "in_kind",
    "financial",
)


class PledgeCreateSchema(CamelSchema):
    opportunity_id = fields.Integer(
        required=True,
        validate=validate.Range(min=1),
    )

    pledge_type = fields.String(
        data_key="type",
        required=True,
        validate=validate.OneOf(PLEDGE_TYPES),
    )

    quantity = fields.Integer(
        required=False,
        allow_none=True,
        validate=validate.Range(min=1),
    )

    amount = fields.Float(
        required=False,
        allow_none=True,
        validate=validate.Range(min=0.01),
    )

    description = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(max=255),
    )

    payment_method = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(max=30),
    )


class PledgeSchema(CamelSchema):
    id = fields.Integer(dump_only=True)

    reference = fields.String(dump_only=True)

    opportunity_id = fields.Integer(dump_only=True)

    opportunity_title = fields.Method(
        "get_opportunity_title",
        dump_only=True,
    )

    amount = fields.Float(dump_only=True)

    date = fields.DateTime(
        attribute="created_at",
        dump_only=True,
    )

    created_at = fields.DateTime(dump_only=True)

    status = fields.Method(
        "get_status",
        dump_only=True,
    )

    donor_id = fields.Integer(dump_only=True)

    payment_method = fields.String(dump_only=True)

    def get_opportunity_title(self, pledge):
        if pledge.opportunity is not None:
            return pledge.opportunity.title

        return ""

    def get_status(self, pledge):
        status_labels = {
            "pending": "Pending",
            "confirmed": "Confirmed",
            "fulfilled": "Fulfilled",
            "cancelled": "Cancelled",
        }

        return status_labels.get(
            pledge.status,
            "Pending",
        )
