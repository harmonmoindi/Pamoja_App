from datetime import date, datetime

from marshmallow import ValidationError
import pytest

from app.schemas.task_schema import TaskCreateSchema, TaskSchema


def test_task_output_uses_camel_case():
    task = type("Task", (), {})()
    task.id = 1
    task.organization_id = 4
    task.assignee_id = None
    task.request_id = 9
    task.title = "Review food requests"
    task.status = "To Do"
    task.due_date = date(2026, 11, 20)
    task.created_at = datetime(2026, 11, 18, 8, 0)
    task.updated_at = datetime(2026, 11, 18, 8, 0)

    data = TaskSchema().dump(task)

    assert data["id"] == 1
    assert data["organizationId"] == 4
    assert data["assigneeId"] is None
    assert data["requestId"] == 9
    assert data["title"] == "Review food requests"
    assert data["status"] == "To Do"
    assert data["dueDate"] == "2026-11-20"
    assert data["createdAt"].startswith("2026-11-18")


def test_create_task_accepts_camel_case():
    data = TaskCreateSchema().load({
        "title": "Verify medical supplies",
        "assigneeId": 3,
        "requestId": 12,
        "status": "In Progress",
        "dueDate": "2026-11-21",
    })

    assert data["title"] == "Verify medical supplies"
    assert data["assignee_id"] == 3
    assert data["request_id"] == 12
    assert data["status"] == "In Progress"
    assert data["due_date"] == date(2026, 11, 21)


def test_create_task_defaults_status_and_allows_blank_due_date():
    data = TaskCreateSchema().load({"title": "Coordinate distribution", "dueDate": ""})

    assert data["status"] == "To Do"
    assert data["due_date"] is None
    assert data["assignee_id"] is None
    assert data["request_id"] is None


def test_create_task_requires_a_title():
    with pytest.raises(ValidationError):
        TaskCreateSchema().load({"assigneeId": 3})


def test_create_task_rejects_an_unknown_status():
    with pytest.raises(ValidationError):
        TaskCreateSchema().load({"title": "Review requests", "status": "pending"})
