from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from app.models.task import Task
from app.models.user import User
from app.schemas.task_schema import TaskCreateSchema, TaskSchema, TaskUpdateSchema
from app.services import audit_service
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.validators import parse_body

bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


def _owned_organization(user_id: int, organization_id: int | None = None) -> Organization:
    stmt = select(Organization).where(Organization.owner_id == user_id)
    if organization_id is not None:
        stmt = stmt.where(Organization.id == organization_id)
    organization = db.session.scalar(stmt.order_by(Organization.id))
    if organization is None:
        raise ApiError(404, "not_found", "Organization not found")
    return organization


def _require_assignee(assignee_id: int | None) -> None:
    if assignee_id is None:
        return
    if db.session.get(User, assignee_id) is None:
        raise ApiError(404, "not_found", "Assignee not found")


def _require_request(request_id: int | None, organization_id: int) -> None:
    if request_id is None:
        return
    assistance_request = db.session.get(AssistanceRequest, request_id)
    if assistance_request is None or assistance_request.organization_id != organization_id:
        raise ApiError(404, "not_found", "Assistance request not found")


def _get_agency_task(task_id: int, user_id: int) -> Task:
    task = db.session.scalar(
        select(Task)
        .join(Organization, Task.organization_id == Organization.id)
        .where(Task.id == task_id, Organization.owner_id == user_id)
        .with_for_update()
    )
    if task is None:
        raise ApiError(404, "not_found", "Task not found")
    return task


@bp.get("")
@role_required("agency")
def list_tasks():
    """Tasks for organizations the logged-in agency owns."""
    user = get_current_user()
    stmt = (
        select(Task)
        .join(Organization, Task.organization_id == Organization.id)
        .where(Organization.owner_id == user.id)
        .order_by(Task.created_at.desc(), Task.id.desc())
    )
    return jsonify(paginate(stmt, TaskSchema()))


@bp.post("")
@role_required("agency")
def create_task():
    """Add a task to the agency's organization."""
    user = get_current_user()
    data = parse_body(TaskCreateSchema())
    _require_assignee(data["assignee_id"])

    if data["request_id"] is not None:
        assistance_request = db.session.get(AssistanceRequest, data["request_id"])
        if assistance_request is None or assistance_request.organization_id is None:
            raise ApiError(404, "not_found", "Assistance request not found")
        organization = _owned_organization(user.id, assistance_request.organization_id)
    else:
        organization = _owned_organization(user.id)

    task = Task(
        organization_id=organization.id,
        assignee_id=data["assignee_id"],
        request_id=data["request_id"],
        title=data["title"].strip(),
        status=data["status"],
        due_date=data["due_date"],
    )
    db.session.add(task)
    db.session.flush()

    audit_service.log_event(
        "agency",
        "Task created",
        f"{task.title} ({task.status})",
        actor=user,
        entity_type="task",
        entity_id=task.id,
        commit=False,
    )
    db.session.commit()
    return jsonify({"task": TaskSchema().dump(task)}), 201


@bp.patch("/<int:task_id>")
@role_required("agency")
def update_task(task_id):
    """Update a task the agency owns."""
    user = get_current_user()
    data = parse_body(TaskUpdateSchema())
    if not data:
        raise ApiError(400, "validation_error", "No task changes were provided")

    task = _get_agency_task(task_id, user.id)
    if "assignee_id" in data:
        _require_assignee(data["assignee_id"])
        task.assignee_id = data["assignee_id"]
    if "request_id" in data:
        _require_request(data["request_id"], task.organization_id)
        task.request_id = data["request_id"]
    if "title" in data:
        task.title = data["title"].strip()
    if "status" in data:
        task.status = data["status"]
    if "due_date" in data:
        task.due_date = data["due_date"]

    audit_service.log_event(
        "agency",
        "Task updated",
        f"{task.title} is now {task.status}",
        actor=user,
        entity_type="task",
        entity_id=task.id,
        commit=False,
    )
    db.session.commit()
    return jsonify({"task": TaskSchema().dump(task)})
