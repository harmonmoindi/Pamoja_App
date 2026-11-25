from marshmallow import fields, validate

from app.schemas import CamelSchema


class DonationCreateSchema(CamelSchema):
    amount = fields.Float(
        required=True,
        validate=validate.Range(min=1),
    )

    phone = fields.String(
        required=True,
        validate=validate.Regexp(
            r"^(?:\+254|254|0)?[17]\d{8}$",
            error="Enter a valid Kenyan mobile number.",
        ),
    )

    opportunity_id = fields.Integer(
        required=False,
        allow_none=True,
        validate=validate.Range(min=1),
    )


class DonationSchema(CamelSchema):
    id = fields.Integer(dump_only=True)

    reference = fields.String(dump_only=True)

    donor_id = fields.Integer(dump_only=True)

    opportunity_id = fields.Integer(
        dump_only=True,
        allow_none=True,
    )

    opportunity_title = fields.Method(
        "get_opportunity_title",
        dump_only=True,
    )

    amount = fields.Float(dump_only=True)

    payment_method = fields.String(dump_only=True)

    transaction_code = fields.String(
        attribute="mpesa_receipt",
        dump_only=True,
        allow_none=True,
    )

    status = fields.Method(
        "get_status",
        dump_only=True,
    )

    date = fields.DateTime(
        attribute="created_at",
        dump_only=True,
    )

    created_at = fields.DateTime(dump_only=True)

    def get_opportunity_title(self, donation):
        if donation.opportunity is not None:
            return donation.opportunity.title

        return None

    def get_status(self, donation):
        status_labels = {
            "pending": "Pending",
            "processing": "Processing",
            "successful": "Successful",
            "failed": "Failed",
        }

        return status_labels.get(
            donation.status,
            "Pending",
        )
