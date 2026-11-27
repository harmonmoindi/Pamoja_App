import pytest
from marshmallow import ValidationError
from sqlalchemy import select

from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.delivery import Delivery
from app.models.organization import Organization
from app.models.receipt_confirmation import ReceiptConfirmation
from app.schemas.request_schema import AssistanceRequestCreateSchema
from app.schemas.receipt_schema import ReceiptCreateSchema
from tests.conftest import bearer


@pytest.fixture()
def make_organization(app, make_user):
    counter = {"n": 0}

    def _make(owner_email=None, name=None):
        counter["n"] += 1
        n = counter["n"]
        owner = make_user(
            role="agency",
            email=owner_email or f"agency{n}@example.org",
            name="Agency Owner",
        )
        org = Organization(
            name=name or f"Demo Agency {n}",
            categories=["Education"],
            counties=["Turkana County"],
            verification_status="verified",
            owner_id=owner.id,
        )
        db.session.add(org)
        db.session.commit()
        return org

    return _make


@pytest.fixture()
def make_assistance_request(app, make_user, make_organization):
    counter = {"n": 0}

    def _make(beneficiary=None, organization=None, **overrides):
        counter["n"] += 1
        if beneficiary is None:
            beneficiary = make_user(
                role="beneficiary",
                email=f"beneficiary{counter['n']}@example.org",
                name="Beneficiary",
            )
        if organization is None:
            organization = make_organization()
        data = {
            "beneficiary_id": beneficiary.id,
            "organization_id": organization.id,
            "title": "School supplies",
            "category": "Education",
            "county": "Turkana",
            "summary": "Exercise books for students",
            "resource": "Exercise books",
            "quantity": 50,
            "allocated": 0,
            "unit": "packs",
            "urgency": "High",
            "stage": "Delivered",
            "reference": f"PAM-REQ-{1000 + counter['n']}",
        }
        data.update(overrides)
        request = AssistanceRequest(**data)
        db.session.add(request)
        db.session.commit()
        return request

    return _make


@pytest.fixture()
def make_delivery(app, make_assistance_request):
    counter = {"n": 0}

    def _make(assistance_request=None, status="delivered", **overrides):
        counter["n"] += 1
        if assistance_request is None:
            assistance_request = make_assistance_request()
        data = {
            "reference": f"PAM-DEL-{1000 + counter['n']}",
            "request_id": assistance_request.id,
            "organization_id": assistance_request.organization_id,
            "status": status,
        }
        data.update(overrides)
        delivery = Delivery(**data)
        db.session.add(delivery)
        db.session.commit()
        return delivery

    return _make


def test_create_schema_accepts_valid_payload():
    data = AssistanceRequestCreateSchema().load({
        "title": "School supplies",
        "category": "Education",
        "county": "Turkana",
        "summary": "Need books",
        "resource": "Exercise books",
        "quantity": 10,
        "urgency": "High",
        "organizationId": 1,
    })
    assert data["quantity"] == 10
    assert data["urgency"] == "High"
    assert data["organization_id"] == 1


def test_create_schema_rejects_blank_title():
    with pytest.raises(ValidationError):
        AssistanceRequestCreateSchema().load({
            "title": " ",
            "category": "Education",
            "county": "Turkana",
            "summary": "Need books",
            "resource": "Exercise books",
            "quantity": 10,
            "organizationId": 1,
        })


def test_create_schema_requires_organization():
    with pytest.raises(ValidationError):
        AssistanceRequestCreateSchema().load({
            "title": "School supplies",
            "category": "Education",
            "county": "Turkana",
            "summary": "Need books",
            "resource": "Exercise books",
            "quantity": 10,
        })


def test_receipt_schema_rejects_unknown_outcome():
    with pytest.raises(ValidationError):
        ReceiptCreateSchema().load({"deliveryId": 1, "outcome": "maybe"})


def test_beneficiary_can_create_a_request(client, make_user, login, make_organization):
    make_user(role="beneficiary", email="grace@example.org", name="Grace")
    org = make_organization(name="Garissa Community Support Trust")
    token = login("grace@example.org").get_json()["token"]

    res = client.post(
        "/api/requests",
        json={
            "title": "Food packages",
            "category": "Food Security",
            "county": "Garissa",
            "summary": "Household food packages",
            "resource": "Food parcels",
            "quantity": 80,
            "urgency": "High",
            "organizationId": org.id,
        },
        headers=bearer(token),
    )

    assert res.status_code == 201
    body = res.get_json()["request"]
    assert body["stage"] == "Need identified"
    assert body["reference"].startswith("PAM-REQ-")
    assert body["quantity"] == 80
    assert body["organizationId"] == org.id


def test_donor_cannot_create_a_request(client, make_user, login, make_organization):
    make_user(role="donor", email="donor@example.org")
    org = make_organization()
    token = login("donor@example.org").get_json()["token"]

    res = client.post(
        "/api/requests",
        json={
            "title": "Food packages",
            "category": "Food Security",
            "county": "Garissa",
            "summary": "Household food packages",
            "resource": "Food parcels",
            "quantity": 80,
            "organizationId": org.id,
        },
        headers=bearer(token),
    )
    assert res.status_code == 403


def test_beneficiary_lists_only_own_requests(client, make_user, login, make_assistance_request):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    joseph = make_user(role="beneficiary", email="joseph@example.org", name="Joseph")
    make_assistance_request(beneficiary=grace, title="Grace request", reference="PAM-REQ-1101")
    make_assistance_request(beneficiary=joseph, title="Joseph request", reference="PAM-REQ-1102")

    token = login("grace@example.org").get_json()["token"]
    res = client.get("/api/requests/mine", headers=bearer(token))

    assert res.status_code == 200
    items = res.get_json()["items"]
    assert len(items) == 1
    assert items[0]["title"] == "Grace request"


def test_beneficiary_can_confirm_complete_receipt(
    client, make_user, login, make_assistance_request, make_delivery
):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    assistance_request = make_assistance_request(beneficiary=grace, stage="Delivered")
    delivery = make_delivery(assistance_request=assistance_request, status="delivered")

    token = login("grace@example.org").get_json()["token"]
    res = client.post(
        "/api/receipts",
        json={"deliveryId": delivery.id, "outcome": "complete", "comments": "All good"},
        headers=bearer(token),
    )

    assert res.status_code == 201
    assert res.get_json()["receipt"]["outcome"] == "complete"

    db.session.refresh(assistance_request)
    assert assistance_request.stage == "Confirmed"
    assert db.session.scalar(
        select(ReceiptConfirmation).where(ReceiptConfirmation.delivery_id == delivery.id)
    ) is not None


def test_cannot_confirm_undelivered_package(
    client, make_user, login, make_assistance_request, make_delivery
):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    assistance_request = make_assistance_request(beneficiary=grace)
    delivery = make_delivery(assistance_request=assistance_request, status="in_transit")

    token = login("grace@example.org").get_json()["token"]
    res = client.post(
        "/api/receipts",
        json={"deliveryId": delivery.id, "outcome": "complete"},
        headers=bearer(token),
    )

    assert res.status_code == 409
    assert res.get_json()["error"]["code"] == "not_delivered"


def test_cannot_confirm_same_delivery_twice(
    client, make_user, login, make_assistance_request, make_delivery
):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    assistance_request = make_assistance_request(beneficiary=grace)
    delivery = make_delivery(assistance_request=assistance_request, status="delivered")

    token = login("grace@example.org").get_json()["token"]
    headers = bearer(token)
    first = client.post(
        "/api/receipts",
        json={"deliveryId": delivery.id, "outcome": "partial"},
        headers=headers,
    )
    second = client.post(
        "/api/receipts",
        json={"deliveryId": delivery.id, "outcome": "complete"},
        headers=headers,
    )

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.get_json()["error"]["code"] == "already_confirmed"
