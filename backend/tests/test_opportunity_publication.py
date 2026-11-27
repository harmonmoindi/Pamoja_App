import pytest
from decimal import Decimal
from sqlalchemy import select

from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from tests.conftest import bearer


@pytest.fixture()
def publication_data(app, make_user):
    """Create isolated users, agency and beneficiary request."""

    agency = make_user(
        role="agency",
        email="publication.agency@example.org",
    )

    other_agency = make_user(
        role="agency",
        email="publication.other@example.org",
    )

    beneficiary = make_user(
        role="beneficiary",
        email="publication.beneficiary@example.org",
    )

    donor = make_user(
        role="donor",
        email="publication.donor@example.org",
    )

    organization = Organization(
        name="Publication Test Agency",
        categories=["Education"],
        counties=["Turkana"],
        verification_status="verified",
        owner_id=agency.id,
    )

    db.session.add(organization)
    db.session.flush()

    assistance_request = AssistanceRequest(
        reference="PAM-REQ-PUBLICATION",
        beneficiary_id=beneficiary.id,
        organization_id=organization.id,
        title="School supplies for learners",
        category="Education",
        county="Turkana",
        summary="Private beneficiary request information",
        resource="Exercise books",
        quantity=50,
        allocated=10,
        unit="packs",
        urgency="High",
        stage="Need identified",
    )

    db.session.add(assistance_request)
    db.session.commit()

    return {
        "agency": agency,
        "other_agency": other_agency,
        "beneficiary": beneficiary,
        "donor": donor,
        "organization": organization,
        "request": assistance_request,
    }


def get_headers(login, email):
    """Authenticate a user and return bearer-token headers."""

    response = login(email)

    assert response.status_code == 200

    token = response.get_json()["token"]

    return bearer(token)


def approve_request(client, login, request_id):
    """Approve a beneficiary request through the agency API."""

    headers = get_headers(
        login,
        "publication.agency@example.org",
    )

    response = client.post(
        f"/api/requests/{request_id}/assessment",
        json={
            "outcome": "approved",
            "priority": "High",
            "notes": "Beneficiary need verified",
        },
        headers=headers,
    )

    assert response.status_code == 201, response.get_json()

    return headers


def test_approved_request_can_be_published(
    client,
    login,
    publication_data,
):
    """Approved requests become donor opportunities."""

    assistance_request = publication_data["request"]

    agency_headers = approve_request(
        client,
        login,
        assistance_request.id,
    )

    donor_headers = get_headers(
        login,
        "publication.donor@example.org",
    )

    # Confirm the request is not yet visible as an opportunity.
    before = client.get(
        "/api/opportunities",
        headers=donor_headers,
    )

    assert before.status_code == 200
    assert before.get_json()["total"] == 0

    # Publish the approved request.
    response = client.post(
        f"/api/opportunities/from-request/{assistance_request.id}",
        headers=agency_headers,
    )

    assert response.status_code == 201, response.get_json()

    opportunity_id = response.get_json()["opportunity"]["id"]

    opportunity = db.session.get(
        Opportunity,
        opportunity_id,
    )

    assert opportunity is not None
    assert opportunity.request_id == assistance_request.id
    assert opportunity.organization_id == assistance_request.organization_id
    assert opportunity.stage == "Published"
    assert opportunity.target_qty == Decimal("40")
    assert opportunity.pledged_qty == Decimal("0")

    db.session.refresh(assistance_request)

    assert assistance_request.stage == "Published"

    # Confirm donors can now discover the opportunity.
    after = client.get(
        "/api/opportunities",
        headers=donor_headers,
    )

    assert after.status_code == 200

    data = after.get_json()

    assert data["total"] == 1
    assert data["items"][0]["id"] == opportunity_id

    # Private beneficiary information must not be published.
    assert (
        "Private beneficiary request information"
        not in data["items"][0]["description"]
    )


def test_unassessed_request_cannot_be_published(
    client,
    login,
    publication_data,
):
    """Unassessed requests must remain unavailable to donors."""

    assistance_request = publication_data["request"]

    headers = get_headers(
        login,
        "publication.agency@example.org",
    )

    response = client.post(
        f"/api/opportunities/from-request/{assistance_request.id}",
        headers=headers,
    )

    assert response.status_code == 409

    opportunity = db.session.scalar(
        select(Opportunity).where(
            Opportunity.request_id == assistance_request.id
        )
    )

    assert opportunity is None


def test_request_without_approved_assessment_cannot_be_published(
    client,
    login,
    publication_data,
):
    """A stage label alone must not count as approval."""

    assistance_request = publication_data["request"]

    assistance_request.stage = "Assessed"
    db.session.commit()

    headers = get_headers(
        login,
        "publication.agency@example.org",
    )

    response = client.post(
        f"/api/opportunities/from-request/{assistance_request.id}",
        headers=headers,
    )

    assert response.status_code == 409

    assert (
        response.get_json()["error"]["code"]
        == "assessment_not_approved"
    )


def test_other_agency_cannot_publish_request(
    client,
    login,
    publication_data,
):
    """An agency cannot publish another agency's request."""

    assistance_request = publication_data["request"]

    headers = get_headers(
        login,
        "publication.other@example.org",
    )

    response = client.post(
        f"/api/opportunities/from-request/{assistance_request.id}",
        headers=headers,
    )

    assert response.status_code == 404


def test_donor_cannot_publish_request(
    client,
    login,
    publication_data,
):
    """Donors must not have publication privileges."""

    assistance_request = publication_data["request"]

    headers = get_headers(
        login,
        "publication.donor@example.org",
    )

    response = client.post(
        f"/api/opportunities/from-request/{assistance_request.id}",
        headers=headers,
    )

    assert response.status_code == 403


def test_duplicate_publication_is_rejected(
    client,
    login,
    publication_data,
):
    """A request must not create multiple donor opportunities."""

    assistance_request = publication_data["request"]

    headers = approve_request(
        client,
        login,
        assistance_request.id,
    )

    endpoint = (
        f"/api/opportunities/from-request/{assistance_request.id}"
    )

    first = client.post(
        endpoint,
        headers=headers,
    )

    assert first.status_code == 201, first.get_json()

    second = client.post(
        endpoint,
        headers=headers,
    )

    assert second.status_code == 409

    opportunities = db.session.scalars(
        select(Opportunity).where(
            Opportunity.request_id == assistance_request.id
        )
    ).all()

    assert len(opportunities) == 1