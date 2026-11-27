from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from tests.conftest import bearer


def test_admin_lists_all_assistance_requests(client, make_user, login):
    admin = make_user(role="admin", email="admin@example.org")
    agency = make_user(role="agency", email="agency@example.org")
    beneficiary = make_user(role="beneficiary", email="grace@example.org")
    org = Organization(
        name="Pamoja Demo Education Partner",
        categories=["Education"],
        counties=["Turkana County"],
        verification_status="verified",
        owner_id=agency.id,
    )
    db.session.add(org)
    db.session.flush()
    request = AssistanceRequest(
        reference="PAM-REQ-2001",
        beneficiary_id=beneficiary.id,
        organization_id=org.id,
        title="School supplies",
        category="Education",
        county="Turkana",
        summary="Exercise books required",
        resource="Exercise books",
        quantity=50,
        allocated=0,
        unit="packs",
        urgency="High",
        stage="Need identified",
        priority=None,
    )
    db.session.add(request)
    db.session.commit()

    token = login("admin@example.org").get_json()["token"]
    response = client.get("/api/admin/requests", headers=bearer(token))
    assert response.status_code == 200
    body = response.get_json()
    assert body["total"] >= 1
    item = next(row for row in body["items"] if row["reference"] == "PAM-REQ-2001")
    assert item["agency"] == "Pamoja Demo Education Partner"
    assert item["stage"] == "Need identified"
    assert item["priority"] == "High priority"
    assert admin.id


def test_non_admin_cannot_list_oversight_requests(client, make_user, login):
    make_user(role="beneficiary", email="grace@example.org")
    token = login("grace@example.org").get_json()["token"]
    response = client.get("/api/admin/requests", headers=bearer(token))
    assert response.status_code == 403
