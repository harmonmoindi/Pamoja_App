from marshmallow import fields, validate

from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import CHECKLIST_ITEMS, VERIFICATION_STATUSES, Organization
from app.schemas import CamelSchema

PRIORITIES = ("Urgent", "High priority", "Standard")
URGENCY_TO_PRIORITY = {"High": "Urgent", "Medium": "High priority", "Low": "Standard"}


def request_priority(req) -> str:
    """The priority an admin sees: the assessed priority if it is a known one, otherwise derived from urgency."""
    if req.priority in PRIORITIES:
        return req.priority
    return URGENCY_TO_PRIORITY.get(req.urgency, "Standard")


# ---------------------------------------------------------------- agency verification
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


# ---------------------------------------------------------------- audit log
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


# ---------------------------------------------------------------- request oversight
class OversightRequestSchema(CamelSchema):
    """A request as the admin sees it. Matches the OversightRequest type in frontend/src/types/admin.ts."""

    id = fields.Int()
    reference = fields.Method("get_reference")
    title = fields.Str()
    category = fields.Str()
    county = fields.Str()
    agency = fields.Method("get_agency")
    stage = fields.Str()
    priority = fields.Method("get_priority")
    updated_on = fields.Method("get_updated_on")

    def get_reference(self, req):
        return req.reference or f"#{req.id}"

    def get_agency(self, req):
        org = db.session.get(Organization, req.organization_id) if req.organization_id else None
        return org.name if org else "Unassigned"

    def get_priority(self, req):
        return request_priority(req)

    def get_updated_on(self, req):
        return req.updated_at.date().isoformat()


# ---------------------------------------------------------------- duplicate review
def _request_summary(request_id):
    req = db.session.get(AssistanceRequest, request_id)
    if req is None:
        return None
    return {
        "reference": req.reference or f"#{req.id}",
        "title": req.title,
        "category": req.category,
        "county": req.county,
        "submittedOn": req.created_at.date().isoformat(),
    }


class DuplicateFlagSchema(CamelSchema):
    """Matches the DuplicatePair type in frontend/src/types/admin.ts."""

    id = fields.Int()
    status = fields.Str()
    signals = fields.List(fields.Str())
    a = fields.Method("get_a")
    b = fields.Method("get_b")

    def get_a(self, flag):
        return _request_summary(flag.request_a_id)

    def get_b(self, flag):
        return _request_summary(flag.request_b_id)


class DuplicateDecisionSchema(CamelSchema):
    """PATCH /admin/duplicates/:id"""

    status = fields.Str(required=True, validate=validate.OneOf(("separate", "escalated")))

