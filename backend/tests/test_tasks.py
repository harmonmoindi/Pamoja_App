from datetime import date

from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from app.models.task import Task
from tests.conftest import bearer


def _agency(make_user, email="agency@example.org"):
    owner = make_user(role="agency", email=email, name="Agency Owner")
    org = Organization(
        name=f"Demo Agency {email}",
        categories=["Food Security"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=owner.id,
    )
    db.session.add(org)
    db.session.commit()
    return owner, org


def _request(org, beneficiary):
    assistance_request = AssistanceRequest(
        beneficiary_id=beneficiary.id,
        organization_id=org.id,
        title="School supplies",
        category="Education",
        county="Nairobi",
        summary="Exercise books",
        resource="Exercise books",
        quantity=20,
        unit="packs",
        urgency="High",
        stage="Need identified",
    )
    db.session.add(assistance_request)
    db.session.commit()
    return assistance_request


def _task(org, title="Review food requests", status="To Do"):
    task = Task(organization_id=org.id, title=title, status=status, due_date=date(2026, 11, 20))
    db.session.add(task)
    db.session.commit()
    return task


def test_agency_lists_only_own_tasks(client, make_user, login):
    _, org = _agency(make_user)
    _, other = _agency(make_user, email="other@example.org")
    own = _task(org, title="Own task")
    _task(other, title="Other task")
    token = login("agency@example.org").get_json()["token"]

    res = client.get("/api/tasks", headers=bearer(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == own.id
    assert body["items"][0]["title"] == "Own task"
    assert body["items"][0]["status"] == "To Do"
    assert body["items"][0]["dueDate"] == "2026-11-20"


def test_beneficiary_cannot_list_tasks(client, make_user, login):
    make_user(role="beneficiary", email="grace@example.org", name="Grace")
    token = login("grace@example.org").get_json()["token"]

    res = client.get("/api/tasks", headers=bearer(token))

    assert res.status_code == 403


def test_agency_can_create_a_task(client, make_user, login):
    owner, org = _agency(make_user)
    beneficiary = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    assistance_request = _request(org, beneficiary)
    token = login("agency@example.org").get_json()["token"]

    res = client.post(
        "/api/tasks",
        json={
            "title": "Verify medical supplies",
            "assigneeId": owner.id,
            "requestId": assistance_request.id,
            "dueDate": "2026-11-21",
        },
        headers=bearer(token),
    )

    assert res.status_code == 201
    task = res.get_json()["task"]
    assert task["organizationId"] == org.id
    assert task["assigneeId"] == owner.id
    assert task["requestId"] == assistance_request.id
    assert task["status"] == "To Do"
    assert task["dueDate"] == "2026-11-21"


def test_create_task_rejects_another_agencys_request(client, make_user, login):
    _agency(make_user)
    _, other = _agency(make_user, email="other@example.org")
    beneficiary = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    assistance_request = _request(other, beneficiary)
    token = login("agency@example.org").get_json()["token"]

    res = client.post(
        "/api/tasks",
        json={"title": "Review requests", "requestId": assistance_request.id},
        headers=bearer(token),
    )

    assert res.status_code == 404
    assert db.session.query(Task).count() == 0


def test_agency_can_update_a_task(client, make_user, login):
    _, org = _agency(make_user)
    task = _task(org)
    token = login("agency@example.org").get_json()["token"]

    res = client.patch(
        f"/api/tasks/{task.id}",
        json={"status": "In Progress", "dueDate": ""},
        headers=bearer(token),
    )

    assert res.status_code == 200
    body = res.get_json()["task"]
    assert body["status"] == "In Progress"
    assert body["dueDate"] is None
    assert body["title"] == "Review food requests"
    db.session.refresh(task)
    assert task.status == "In Progress"
    assert task.due_date is None


def test_agency_cannot_update_another_agencys_task(client, make_user, login):
    _agency(make_user)
    _, other = _agency(make_user, email="other@example.org")
    task = _task(other, status="To Do")
    token = login("agency@example.org").get_json()["token"]

    res = client.patch(f"/api/tasks/{task.id}", json={"status": "Completed"}, headers=bearer(token))

    assert res.status_code == 404
    db.session.refresh(task)
    assert task.status == "To Do"


def test_update_task_rejects_an_unknown_status(client, make_user, login):
    _, org = _agency(make_user)
    task = _task(org)
    token = login("agency@example.org").get_json()["token"]

    res = client.patch(f"/api/tasks/{task.id}", json={"status": "pending"}, headers=bearer(token))

    assert res.status_code == 400
    db.session.refresh(task)
    assert task.status == "To Do"
