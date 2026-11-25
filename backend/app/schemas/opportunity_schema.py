from marshmallow import fields

from app.schemas import CamelSchema


class OpportunitySchema(CamelSchema):
    id = fields.Integer(dump_only=True)

    title = fields.String(dump_only=True)
    description = fields.String(dump_only=True)
    category = fields.String(dump_only=True)

    county = fields.String(dump_only=True)

    location = fields.Method(
        "get_location",
        dump_only=True,
    )

    target_amount = fields.Float(
        attribute="target_qty",
        dump_only=True,
    )

    raised_amount = fields.Float(
        attribute="pledged_qty",
        dump_only=True,
    )

    beneficiaries = fields.Method(
        "get_beneficiaries",
        dump_only=True,
    )

    urgency = fields.String(dump_only=True)

    status = fields.Method(
        "get_status",
        dump_only=True,
    )

    organization = fields.Method(
        "get_organization",
        dump_only=True,
    )

    created_at = fields.DateTime(dump_only=True)

    def get_location(self, opportunity):
        return opportunity.county

    def get_beneficiaries(self, opportunity):
        # The current Opportunity model has no beneficiaries column.
        # Return zero rather than inventing a count.
        return 0

    def get_status(self, opportunity):
        return opportunity.stage

    def get_organization(self, opportunity):
        if opportunity.organization is not None:
            return opportunity.organization.name

        return "Pamoja Community"
