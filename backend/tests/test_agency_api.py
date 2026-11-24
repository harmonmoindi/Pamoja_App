import pytest

from app.extensions import db
from app.models.organization import Organization
from app.models.assistance_request import AssistanceRequest
from app.models.inventory_item import InventoryItem
from tests.conftest import bearer


@pytest.fixture()
def agency_data(app, make_user):

    # Create two agency users
    agency1 = make_user(
        role="agency",
        email="agency1@example.org"
    )

    agency2 = make_user(
        role="agency",
        email="agency2@example.org"
    )

    # Create a beneficiary and donor
    beneficiary = make_user(
        role="beneficiary",
        email="beneficiary@example.org"
    )

    donor = make_user(
        role="donor",
        email="donor@example.org"
    )

    # Create two organizations
    org1 = Organization(
        name="Agency One",
        categories=["Education"],
        counties=["Turkana"],
        verification_status="verified",
        owner_id=agency1.id
    )

    org2 = Organization(
        name="Agency Two",
        categories=["Education"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=agency2.id
    )

    db.session.add_all([org1, org2])
    db.session.flush()

    # Request assigned to Agency One
    request1 = AssistanceRequest(
        reference="PAM-REQ-101",
        beneficiary_id=beneficiary.id,
        organization_id=org1.id,
        title="School supplies",
        category="Education",
        county="Turkana",
        summary="Exercise books required",
        resource="Exercise books",
        quantity=50,
        allocated=10,
        unit="packs",
        urgency="High",
        stage="Need identified"
    )

    # Request assigned to Agency Two
    request2 = AssistanceRequest(
        reference="PAM-REQ-102",
        beneficiary_id=beneficiary.id,
        organization_id=org2.id,
        title="Other school supplies",
        category="Education",
        county="Nairobi",
        summary="More books required",
        resource="Exercise books",
        quantity=20,
        allocated=0,
        unit="packs",
        urgency="Medium",
        stage="Need identified"
    )

    # Inventory belonging to Agency One
    inventory = InventoryItem(
        reference="PAM-INV-101",
        organization_id=org1.id,
        name="Exercise books",
        category="Education",
        county="Turkana",
        quantity=30,
        minimum=5,
        unit="packs"
    )

    db.session.add_all([
        request1,
        request2,
        inventory
    ])

    db.session.commit()

    return {
        "agency1": agency1,
        "agency2": agency2,
        "beneficiary": beneficiary,
        "donor": donor,
        "request1": request1,
        "request2": request2,
        "inventory": inventory
    }


def get_token(login, email):
    response = login(email)
    assert response.status_code == 200
    return response.get_json()["token"]


def test_agency_lists_only_assigned_requests(
    client, login, agency_data
):
    token = get_token(login, "agency1@example.org")

    response = client.get(
        "/api/requests",
        headers=bearer(token)
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["total"] == 1
    assert data["items"][0]["id"] == agency_data["request1"].id


def test_agency_gets_matching_resources(
    client, login, agency_data
):
    token = get_token(login, "agency1@example.org")

    request_id = agency_data["request1"].id

    response = client.get(
        f"/api/matching/{request_id}",
        headers=bearer(token)
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["required"] == 50
    assert data["allocated"] == 10
    assert data["remaining"] == 40

    assert len(data["matches"]) == 1

    match = data["matches"][0]

    assert match["resourceId"] == agency_data["inventory"].id
    assert match["available"] == 25
    assert match["suggestedQuantity"] == 25
    assert match["sameCounty"] is True


def test_other_agency_cannot_access_request_matches(
    client, login, agency_data
):
    token = get_token(login, "agency2@example.org")

    request_id = agency_data["request1"].id

    response = client.get(
        f"/api/matching/{request_id}",
        headers=bearer(token)
    )

    assert response.status_code == 404


def test_donor_cannot_access_matching(
    client, login, agency_data
):
    token = get_token(login, "donor@example.org")

    request_id = agency_data["request1"].id

    response = client.get(
        f"/api/matching/{request_id}",
        headers=bearer(token)
    )

    assert response.status_code == 403


def test_assessment_delivery_and_receipt_workflow(
    client, login, agency_data
):
    agency_token = get_token(
        login,
        "agency1@example.org"
    )

    request_id = agency_data["request1"].id

    # Step 1: Assess the request
    assessment_response = client.post(
        f"/api/requests/{request_id}/assessment",
        json={
            "outcome": "approved",
            "priority": "High",
            "notes": "Request verified"
        },
        headers=bearer(agency_token)
    )

    assert assessment_response.status_code == 201

    db.session.refresh(agency_data["request1"])
    assert agency_data["request1"].stage == "Assessed"

    # Step 2: Create delivery
    delivery_response = client.post(
        "/api/deliveries",
        json={"requestId": request_id},
        headers=bearer(agency_token)
    )

    assert delivery_response.status_code == 201

    delivery_id = delivery_response.get_json()["delivery"]["id"]

    # Step 3: Progress delivery statuses
    for status in ["assigned", "in_transit", "delivered"]:

        response = client.patch(
            f"/api/deliveries/{delivery_id}",
            json={"status": status},
            headers=bearer(agency_token)
        )

        assert response.status_code == 200
        assert response.get_json()["delivery"]["status"] == status

    # Step 4: Beneficiary confirms receipt
    beneficiary_token = get_token(
        login,
        "beneficiary@example.org"
    )

    receipt_response = client.post(
        "/api/receipts",
        json={
            "deliveryId": delivery_id,
            "outcome": "complete"
        },
        headers=bearer(beneficiary_token)
    )

    assert receipt_response.status_code == 201

    db.session.refresh(agency_data["request1"])
    assert agency_data["request1"].stage == "Confirmed"

def test_successful_resource_allocation(client, login, agency_data):

    request = agency_data["request1"]
    inventory = agency_data["inventory"]

    # Mark the request as assessed.
    request.stage = "Assessed"
    db.session.commit()

    token = get_token(login, "agency1@example.org")

    response = client.post(
        "/api/matching/allocate",
        json={
            "requestId": request.id,
            "resourceId": inventory.id,
            "quantity": 10
        },
        headers=bearer(token)
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["allocatedQuantity"] == 10
    assert data["totalAllocated"] == 20
    assert data["remaining"] == 30
    assert data["inventoryRemaining"] == 20
    assert data["available"] == 15

    db.session.refresh(request)
    db.session.refresh(inventory)

    assert request.allocated == 20
    assert inventory.quantity == 20

def test_allocation_rejects_insufficient_stock(
    client, login, agency_data
):

    request = agency_data["request1"]
    inventory = agency_data["inventory"]

    request.stage = "Assessed"
    db.session.commit()

    token = get_token(login, "agency1@example.org")

    response = client.post(
        "/api/matching/allocate",
        json={
            "requestId": request.id,
            "resourceId": inventory.id,
            "quantity": 26
        },
        headers=bearer(token)
    )

    assert response.status_code == 409

    db.session.refresh(request)
    db.session.refresh(inventory)

    assert request.allocated == 10
    assert inventory.quantity == 30

def test_allocation_rejects_unassessed_request(
    client, login, agency_data
):

    request = agency_data["request1"]
    inventory = agency_data["inventory"]

    token = get_token(login, "agency1@example.org")

    response = client.post(
        "/api/matching/allocate",
        json={
            "requestId": request.id,
            "resourceId": inventory.id,
            "quantity": 5
        },
        headers=bearer(token)
    )

    assert response.status_code == 409

    assert response.get_json()["error"]["code"] == (
        "invalid_request_stage"
    )

def test_other_agency_cannot_allocate_resources(
    client, login, agency_data
):

    request = agency_data["request1"]
    inventory = agency_data["inventory"]

    request.stage = "Assessed"
    db.session.commit()

    token = get_token(login, "agency2@example.org")

    response = client.post(
        "/api/matching/allocate",
        json={
            "requestId": request.id,
            "resourceId": inventory.id,
            "quantity": 5
        },
        headers=bearer(token)
    )

    assert response.status_code == 404

def test_donor_cannot_allocate_resources(
    client, login, agency_data
):

    request = agency_data["request1"]
    inventory = agency_data["inventory"]

    token = get_token(login, "donor@example.org")

    response = client.post(
        "/api/matching/allocate",
        json={
            "requestId": request.id,
            "resourceId": inventory.id,
            "quantity": 5
        },
        headers=bearer(token)
    )

    assert response.status_code == 403

def test_allocation_rejects_invalid_quantity(
    client, login, agency_data
):

    request = agency_data["request1"]
    inventory = agency_data["inventory"]

    request.stage = "Assessed"
    db.session.commit()

    token = get_token(login, "agency1@example.org")

    response = client.post(
        "/api/matching/allocate",
        json={
            "requestId": request.id,
            "resourceId": inventory.id,
            "quantity": 0
        },
        headers=bearer(token)
    )

    assert response.status_code == 400

def test_fully_allocated_request_updates_stage(
    client, login, agency_data
):

    request = agency_data["request1"]
    inventory = agency_data["inventory"]

    request.stage = "Assessed"
    request.quantity = 30

    db.session.commit()

    token = get_token(login, "agency1@example.org")

    response = client.post(
        "/api/matching/allocate",
        json={
            "requestId": request.id,
            "resourceId": inventory.id,
            "quantity": 20
        },
        headers=bearer(token)
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["remaining"] == 0
    assert data["totalAllocated"] == 30

    db.session.refresh(request)
    db.session.refresh(inventory)

    assert request.stage == "Allocated"
    assert inventory.quantity == 10