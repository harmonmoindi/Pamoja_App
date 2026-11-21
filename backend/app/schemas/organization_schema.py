from marshmallow import fields

from app.schemas import CamelSchema


class OrganizationSchema(CamelSchema):
    id = fields.Int()
    name = fields.Str()
    categories = fields.List(fields.Str())
    counties = fields.List(fields.Str())
    verification_status = fields.Str()
    note = fields.Str(allow_none=True)
    submitted_on = fields.Method("get_submitted_on")

    def get_submitted_on(self, org):
        return org.submitted_at.date().isoformat()