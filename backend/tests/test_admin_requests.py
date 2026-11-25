from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.audit_log import AuditLog
from app.models.duplicate_flag import DuplicateFlag
from app.models.organization import Organization
from tests.conftest import bearer


def _admin(make_user, login):
    make_user(role="admin", email="admin@example.org")
    return bearer(login("admin@example.org").get_json()["token"])


def _request(beneficiary_id, title="Books for the school", category="Education", county="Turkana County",
             resource="Exercise books", **extra):
    req = AssistanceRequest(
        beneficiary_id=beneficiary_id, title=title, category=category, county=county,
        summary="We need support", resource=resource, quantity=10, **extra,
    )
    db.session.add(req)
    db.session.commit()
    return req


def test_admin_request_endpoints_are_admin_only(client, make_user, login):
    make_user(role="donor", email="donor@example.org")
    headers = bearer(login("donor@example.org").get_json()["token"])
    assert client.get("/api/admin/requests", headers=headers).status_code == 403
    assert client.get("/api/admin/duplicates", headers=headers).status_code == 403
    assert client.post("/api/admin/duplicates/scan", headers=headers).status_code == 403
    assert client.get("/api/admin/requests").status_code == 401


def test_oversight_shows_agency_and_priority(client, make_user, login):
    headers = _admin(make_user, login)
    owner = make_user(role="beneficiary", email="b@example.org", name="Beneficiary")
    org = Organization(name="Helping Hands")
    db.session.add(org)
    db.session.commit()
    _request(owner.id, organization_id=org.id, urgency="High", stage="Published")
    _request(owner.id, title="Water tanks", category="Food Security", urgency="Low")

    body = client.get("/api/admin/requests", headers=headers).get_json()
    assert body["total"] == 2
    by_title = {r["title"]: r for r in body["items"]}
    assert by_title["Books for the school"]["agency"] == "Helping Hands"
    assert by_title["Books for the school"]["priority"] == "Urgent"
    assert by_title["Water tanks"]["agency"] == "Unassigned"
    assert by_title["Water tanks"]["priority"] == "Standard"
    assert {"id", "reference", "category", "county", "stage", "updatedOn"} <= set(by_title["Water tanks"])


def test_oversight_filters(client, make_user, login):
    headers = _admin(make_user, login)
    owner = make_user(role="beneficiary", email="b@example.org", name="Beneficiary")
    _request(owner.id, title="Alpha", stage="Published", urgency="High")
    _request(owner.id, title="Beta", stage="Delivered", urgency="Low")

    assert client.get("/api/admin/requests?stage=Delivered", headers=headers).get_json()["total"] == 1
    assert client.get("/api/admin/requests?priority=Urgent", headers=headers).get_json()["total"] == 1
    found = client.get("/api/admin/requests?q=alp", headers=headers).get_json()
    assert found["total"] == 1 and found["items"][0]["title"] == "Alpha"


def test_scan_flags_similar_requests_once(client, make_user, login):
    headers = _admin(make_user, login)
    one = make_user(role="beneficiary", email="one@example.org", name="One")
    two = make_user(role="beneficiary", email="two@example.org", name="Two")
    _request(one.id)
    _request(two.id, title="Exercise books for school")

    first = client.post("/api/admin/duplicates/scan", headers=headers).get_json()
    assert first["created"] == 1
    again = client.post("/api/admin/duplicates/scan", headers=headers).get_json()
    assert again["created"] == 0  # safe to run twice

    listing = client.get("/api/admin/duplicates", headers=headers).get_json()
    assert listing["total"] == 1
    pair = listing["items"][0]
    assert pair["status"] == "needs-review"
    assert "Same category" in pair["signals"] and len(pair["signals"]) >= 3
    assert pair["a"]["title"] and pair["b"]["title"]
    assert {"reference", "category", "county", "submittedOn"} <= set(pair["a"])
    assert db.session.query(AuditLog).filter_by(title="Possible duplicate flagged").count() == 1


def test_scan_ignores_requests_from_different_counties(client, make_user, login):
    headers = _admin(make_user, login)
    one = make_user(role="beneficiary", email="one@example.org", name="One")
    _request(one.id, county="Turkana County")
    _request(one.id, county="Kisumu County")
    assert client.post("/api/admin/duplicates/scan", headers=headers).get_json()["created"] == 0


def test_admin_decides_a_duplicate(client, make_user, login):
    headers = _admin(make_user, login)
    one = make_user(role="beneficiary", email="one@example.org", name="One")
    a, b = _request(one.id), _request(one.id, title="More exercise books")
    client.post("/api/admin/duplicates/scan", headers=headers)
    flag = db.session.query(DuplicateFlag).one()

    res = client.patch(f"/api/admin/duplicates/{flag.id}", json={"status": "separate"}, headers=headers)
    assert res.status_code == 200
    assert res.get_json()["duplicate"]["status"] == "separate"
    db.session.refresh(flag)
    assert flag.decided_by_id is not None and flag.decided_at is not None
    assert db.session.query(AuditLog).filter_by(title="Marked as separate requests").count() == 1

    assert client.patch(f"/api/admin/duplicates/{flag.id}", json={"status": "bogus"}, headers=headers).status_code == 400
    assert client.patch("/api/admin/duplicates/999", json={"status": "separate"}, headers=headers).status_code == 404