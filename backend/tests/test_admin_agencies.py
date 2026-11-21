from app.extensions import db
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.organization import CHECKLIST_ITEMS, Organization
from app.services import audit_service
from tests.conftest import bearer


def _ticks(*done):
    return [{"label": label, "done": d} for label, d in zip(CHECKLIST_ITEMS, done)]


def _admin(make_user, login):
    make_user(role="admin", email="admin@example.org")
    return bearer(login("admin@example.org").get_json()["token"])


def _agency(make_user, name="Helping Hands", status="pending", ticks=None, counties=None):
    owner = make_user(role="agency", email=f"{name.split()[0].lower()}@example.org", status="pending", name=f"{name} Owner")
    org = Organization(
        name=name, owner_id=owner.id, verification_status=status,
        categories=["Healthcare"], counties=counties or ["Nairobi County"], checklist=ticks,
    )
    db.session.add(org)
    db.session.commit()
    return org, owner


def test_agency_endpoints_are_admin_only(client, make_user, login):
    make_user(role="donor", email="donor@example.org")
    token = login("donor@example.org").get_json()["token"]
    assert client.get("/api/admin/agencies", headers=bearer(token)).status_code == 403
    assert client.get("/api/admin/overview", headers=bearer(token)).status_code == 403
    assert client.get("/api/admin/audit", headers=bearer(token)).status_code == 403
    assert client.get("/api/admin/agencies").status_code == 401


def test_list_agencies_returns_camel_case_fields_and_default_checklist(client, make_user, login):
    headers = _admin(make_user, login)
    _agency(make_user)

    res = client.get("/api/admin/agencies", headers=headers)
    assert res.status_code == 200
    body = res.get_json()
    assert body["total"] == 1
    agency = body["items"][0]
    assert agency["name"] == "Helping Hands"
    assert agency["status"] == "pending"
    assert "submittedOn" in agency
    assert len(agency["checklist"]) == 4
    assert all(item["done"] is False for item in agency["checklist"])
    assert agency["ownerName"] == "Helping Hands Owner"


def test_filter_agencies_by_status_and_search(client, make_user, login):
    headers = _admin(make_user, login)
    _agency(make_user, name="Alpha Aid", status="pending")
    _agency(make_user, name="Beta Relief", status="verified")

    assert client.get("/api/admin/agencies?status=verified", headers=headers).get_json()["total"] == 1
    found = client.get("/api/admin/agencies?q=alpha", headers=headers).get_json()
    assert found["total"] == 1 and found["items"][0]["name"] == "Alpha Aid"


def test_save_checklist_and_notes(client, make_user, login):
    headers = _admin(make_user, login)
    org, _ = _agency(make_user)

    res = client.patch(
        f"/api/admin/agencies/{org.id}",
        json={"checklist": _ticks(True, True, False, False), "adminNotes": "Waiting for safeguarding contact"},
        headers=headers,
    )
    assert res.status_code == 200
    agency = res.get_json()["agency"]
    assert [i["done"] for i in agency["checklist"]] == [True, True, False, False]
    assert agency["adminNotes"] == "Waiting for safeguarding contact"


def test_checklist_validation_rejects_wrong_items(client, make_user, login):
    headers = _admin(make_user, login)
    org, _ = _agency(make_user)
    res = client.patch(
        f"/api/admin/agencies/{org.id}", json={"checklist": [{"label": "Made up item", "done": True}]}, headers=headers
    )
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "validation_error"


def test_cannot_approve_with_incomplete_checklist(client, make_user, login):
    headers = _admin(make_user, login)
    org, _ = _agency(make_user, ticks=_ticks(True, True, True, False))
    res = client.post(f"/api/admin/agencies/{org.id}/decision", json={"decision": "approve"}, headers=headers)
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "checklist_incomplete"


def test_approve_verifies_agency_activates_owner_and_records_audit_and_notification(client, make_user, login):
    headers = _admin(make_user, login)
    org, owner = _agency(make_user, ticks=_ticks(True, True, True, True))

    res = client.post(f"/api/admin/agencies/{org.id}/decision", json={"decision": "approve"}, headers=headers)
    assert res.status_code == 200
    assert res.get_json()["agency"]["status"] == "verified"

    db.session.refresh(owner)
    assert owner.status == "active"
    assert db.session.query(AuditLog).filter_by(title="Agency verified").count() == 1
    assert db.session.query(Notification).filter_by(user_id=owner.id).count() == 1

    # a verified agency cannot be decided twice
    again = client.post(f"/api/admin/agencies/{org.id}/decision", json={"decision": "approve"}, headers=headers)
    assert again.status_code == 409


def test_request_more_information(client, make_user, login):
    headers = _admin(make_user, login)
    org, _ = _agency(make_user)
    res = client.post(f"/api/admin/agencies/{org.id}/decision", json={"decision": "request-info"}, headers=headers)
    assert res.status_code == 200
    agency = res.get_json()["agency"]
    assert agency["status"] == "more-info"
    assert agency["note"] == "Information requested"


def test_unknown_agency_returns_404(client, make_user, login):
    headers = _admin(make_user, login)
    assert client.get("/api/admin/agencies/999", headers=headers).status_code == 404


def test_overview_counts(client, make_user, login):
    headers = _admin(make_user, login)
    _agency(make_user, name="Alpha Aid", status="pending")
    _agency(make_user, name="Beta Relief", status="verified", counties=["Garissa County", "Kitui County"])

    body = client.get("/api/admin/overview", headers=headers).get_json()
    metrics = {m["label"]: m for m in body["metrics"]}
    assert metrics["Pending agencies"]["value"] == "1"
    assert metrics["Verified agencies"]["value"] == "1"
    assert metrics["Verified agencies"]["note"] == "Across 2 counties"
    assert metrics["Registered users"]["value"] == "3"  # admin + two agency owners
    assert body["trustSafety"]["score"] == 100


def test_audit_list_filters_and_shape(client, make_user, login):
    headers = _admin(make_user, login)
    audit_service.log_event("safety", "Possible duplicate flagged", "Two requests look alike")
    audit_service.log_event("agency", "Agency verified", "Helping Hands approved", actor_label="Pamoja Admin")

    body = client.get("/api/admin/audit", headers=headers).get_json()
    assert body["total"] == 2
    event = body["items"][0]
    assert {"id", "kind", "title", "description", "actor", "timestamp"} <= set(event)

    safety = client.get("/api/admin/audit?kind=safety", headers=headers).get_json()
    assert safety["total"] == 1 and safety["items"][0]["actor"] == "System"

    search = client.get("/api/admin/audit?q=helping", headers=headers).get_json()
    assert search["total"] == 1
