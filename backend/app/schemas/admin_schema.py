from marshmallow import fields, validate

from app.models.organization import CHECKLIST_ITEMS, VERIFICATION_STATUSES
from app.schemas import CamelSchema


class AdminAgencySchema(CamelSchema):
    """An agency as the admin sees it. Matches the Agency type in frontend/src/types/admin.ts."""

    id = fields.Int()
    name = fields.Str()
    categories = fields.List(fields.Str())
    counties = fields.List(fields.Str())
    status = fields.Str(attribute="verification_status")
    submitted_on = fields.Method("get_submitted_on")
    updated_on = fields.Method("get_updated_on")
    note = fields.Str(allow_none=True)
    admin_notes = fields.Str(allow_none=True)
    checklist = fields.Method("get_checklist")
    owner_name = fields.Method("get_owner_name")

    def get_submitted_on(self, org):
        return org.submitted_at.date().isoformat()

    def get_updated_on(self, org):
        # Only shown for agencies that resubmitted information
        return org.updated_at.date().isoformat() if org.verification_status == "re-review" else None

    def get_checklist(self, org):
        return org.checklist_items()

    def get_owner_name(self, org):
        return org.owner.name if org.owner else None


class ChecklistItemSchema(CamelSchema):
    label = fields.Str(required=True, validate=validate.OneOf(CHECKLIST_ITEMS))
    done = fields.Bool(required=True)


class AgencyUpdateSchema(CamelSchema):
    """PATCH /admin/agencies/:id  (both fields optional)"""

    checklist = fields.List(fields.Nested(ChecklistItemSchema), validate=validate.Length(equal=len(CHECKLIST_ITEMS)))
    admin_notes = fields.Str(allow_none=True)


class AgencyDecisionSchema(CamelSchema):
    """POST /admin/agencies/:id/decision"""

    decision = fields.Str(required=True, validate=validate.OneOf(("approve", "request-info")))
    admin_notes = fields.Str(load_default=None, allow_none=True)


class AuditEventSchema(CamelSchema):
    """Matches the AuditEvent type in frontend/src/types/admin.ts."""

    id = fields.Int()
    kind = fields.Str()
    title = fields.Str()
    description = fields.Str()
    actor = fields.Method("get_actor")
    timestamp = fields.Method("get_timestamp")

    def get_actor(self, log):
        return log.actor_name

    def get_timestamp(self, log):
        return log.created_at.isoformat()
