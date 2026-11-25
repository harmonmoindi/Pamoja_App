from marshmallow import fields, pre_load, validate

from app.models.task import TASK_STATUSES
from app.schemas import CamelSchema


class _DueDateSchema(CamelSchema):
    @pre_load
    def blank_due_date(self, data, **kwargs):
        if not isinstance(data, dict):
            return data
        cleaned = dict(data)
        for key in ("dueDate", "due_date"):
            if cleaned.get(key) == "":
                cleaned[key] = None
        return cleaned


class TaskSchema(CamelSchema):
    """What the API returns for a task."""

    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    assignee_id = fields.Int(allow_none=True)
    request_id = fields.Int(allow_none=True)
    title = fields.Str()
    status = fields.Str(validate=validate.OneOf(TASK_STATUSES))
    due_date = fields.Date(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class TaskCreateSchema(_DueDateSchema):
    """What an agency may send when creating a task."""

    title = fields.Str(required=True, validate=[
        validate.Length(min=1, max=160),
        validate.Regexp(r"\S", error="Title cannot be blank"),
    ])
    assignee_id = fields.Int(
        load_default=None, allow_none=True, strict=True, validate=validate.Range(min=1)
    )
    request_id = fields.Int(
        load_default=None, allow_none=True, strict=True, validate=validate.Range(min=1)
    )
    status = fields.Str(load_default="To Do", validate=validate.OneOf(TASK_STATUSES))
    due_date = fields.Date(load_default=None, allow_none=True)


class TaskUpdateSchema(_DueDateSchema):
    """PATCH /api/tasks/:id. Send only the fields that should change."""

    title = fields.Str(validate=[
        validate.Length(min=1, max=160),
        validate.Regexp(r"\S", error="Title cannot be blank"),
    ])
    assignee_id = fields.Int(allow_none=True, strict=True, validate=validate.Range(min=1))
    request_id = fields.Int(allow_none=True, strict=True, validate=validate.Range(min=1))
    status = fields.Str(validate=validate.OneOf(TASK_STATUSES))
    due_date = fields.Date(allow_none=True)
