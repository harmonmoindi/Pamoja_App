import pytest
from app.extensions import db
from app.models.organization import Organization
from app.models.assistance_request import AssistanceRequest
from app.models.inventory_item import InventoryItem
from tests.conftest import bearer

@pytest.fixture()
def agency_data(app, make_user):
    agency1 = make_user(role="agency", email="agency1@example.org")
    agency2 = make_user(role="agency", email="agency2@example.org")
    beneficiary = make_user(role="beneficiary", email="beneficiary@example.org")
    donor = make_user(role="donor", email="donor@example.org")
    org1 = Organization(name="Agency One", categories=["Education"], counties=["Turkana"], verification_status="verified", owner_id=agency1.id)
    org2 = Organization(name="Agency Two", categories=["Education"], counties=["Nairobi"], verification_status="verified", owner_id=agency2.id)
    db.session.add_all([org1, org2]); db.session.flush()
    request1 = AssistanceRequest(reference="PAM-REQ-101", beneficiary_id=beneficiary.id, organization_id=org1.id, title="School supplies", category="Education", county="Turkana", summary="Exercise books required", resource="Exercise books", quantity=50, allocated=10, unit="packs", urgency="High", stage="Need identified")
    request2 = AssistanceRequest(reference="PAM-REQ-102", beneficiary_id=beneficiary.id, organization_id=org2.id, title="Other school supplies", category="Education", county="Nairobi", summary="More books required", resource="Exercise books", quantity=20, allocated=0, unit="packs", urgency="Medium", stage="Need identified")
    inventory = InventoryItem(reference="PAM-INV-101", organization_id=org1.id, name="Exercise books", category="Education", county="Turkana", quantity=30, minimum=5, unit="packs")
    db.session.add_all([request1, request2, inventory]); db.session.commit()
    return {"agency1": agency1, "agency2": agency2, "beneficiary": beneficiary, "donor": donor, "request1": request1, "request2": request2, "inventory": inventory}

def get_token(login, email):
    response = login(email)
    assert response.status_code == 200
    return response.get_json()["token"]

def test_agency_lists_only_assigned_requests(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    response = client.get("/api/requests", headers=bearer(token))
    assert response.status_code == 200
    data = response.get_json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == agency_data["request1"].id

def test_agency_gets_matching_resources(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    response = client.get(f'/api/matching/{agency_data["request1"].id}', headers=bearer(token))
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

def test_other_agency_cannot_access_request_matches(client, login, agency_data):
    token = get_token(login, "agency2@example.org")
    response = client.get(f'/api/matching/{agency_data["request1"].id}', headers=bearer(token))
    assert response.status_code == 404

def test_donor_cannot_access_matching(client, login, agency_data):
    token = get_token(login, "donor@example.org")
    response = client.get(f'/api/matching/{agency_data["request1"].id}', headers=bearer(token))
    assert response.status_code == 403

def test_assessment_delivery_and_receipt_workflow(client, login, agency_data):
    from app.models.opportunity import Opportunity
    from sqlalchemy import select

    agency_token = get_token(login, "agency1@example.org")
    request = agency_data["request1"]
    request.quantity = 20
    db.session.commit()

    # 1. Assess the request.
    response = client.post(f"/api/requests/{request.id}/assessment", json={"outcome": "approved", "priority": "High", "notes": "Request verified"}, headers=bearer(agency_token))
    assert response.status_code == 201, response.get_json()
    db.session.refresh(request)
    assert request.stage == "Published"
    opportunity = db.session.scalar(select(Opportunity).where(Opportunity.request_id == request.id))
    assert opportunity is not None
    assert opportunity.stage == "Published"


    # 2. Allocate the remaining 10 packs BEFORE creating the delivery.
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": agency_data["inventory"].id, "quantity": 10}, headers=bearer(agency_token))
    assert response.status_code == 200, response.get_json()
    db.session.refresh(request)
    assert request.allocated == request.quantity == 20
    assert request.stage == "Allocated"

    # 3. Create and progress the delivery.
    response = client.post("/api/deliveries", json={"requestId": request.id}, headers=bearer(agency_token))
    assert response.status_code == 201, response.get_json()
    delivery_id = response.get_json()["delivery"]["id"]
    for status in ["assigned", "in_transit", "delivered"]:
        response = client.patch(f"/api/deliveries/{delivery_id}", json={"status": status}, headers=bearer(agency_token))
        assert response.status_code == 200, response.get_json()
        assert response.get_json()["delivery"]["status"] == status
    db.session.refresh(request)
    assert request.stage == "Delivered"

    # 4. Beneficiary confirms receipt.
    beneficiary_token = get_token(login, "beneficiary@example.org")
    response = client.post("/api/receipts", json={"deliveryId": delivery_id, "outcome": "complete"}, headers=bearer(beneficiary_token))
    assert response.status_code == 201, response.get_json()
    db.session.refresh(request)
    assert request.stage == "Confirmed"

def test_successful_resource_allocation(client, login, agency_data):
    request, inventory = agency_data["request1"], agency_data["inventory"]
    request.stage = "Assessed"; db.session.commit()
    token = get_token(login, "agency1@example.org")
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": inventory.id, "quantity": 10}, headers=bearer(token))
    assert response.status_code == 200
    data = response.get_json()
    assert data["allocatedQuantity"] == 10
    assert data["totalAllocated"] == 20
    assert data["remaining"] == 30
    assert data["inventoryRemaining"] == 20
    assert data["available"] == 15
    db.session.refresh(request); db.session.refresh(inventory)
    assert request.allocated == 20
    assert inventory.quantity == 20

def test_allocation_rejects_insufficient_stock(client, login, agency_data):
    request, inventory = agency_data["request1"], agency_data["inventory"]
    request.stage = "Assessed"; db.session.commit()
    token = get_token(login, "agency1@example.org")
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": inventory.id, "quantity": 26}, headers=bearer(token))
    assert response.status_code == 409
    db.session.refresh(request); db.session.refresh(inventory)
    assert request.allocated == 10
    assert inventory.quantity == 30

def test_allocation_rejects_unassessed_request(client, login, agency_data):
    request, inventory = agency_data["request1"], agency_data["inventory"]
    token = get_token(login, "agency1@example.org")
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": inventory.id, "quantity": 5}, headers=bearer(token))
    assert response.status_code == 409
    assert response.get_json()["error"]["code"] == "invalid_request_stage"

def test_other_agency_cannot_allocate_resources(client, login, agency_data):
    request, inventory = agency_data["request1"], agency_data["inventory"]
    request.stage = "Assessed"; db.session.commit()
    token = get_token(login, "agency2@example.org")
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": inventory.id, "quantity": 5}, headers=bearer(token))
    assert response.status_code == 404

def test_donor_cannot_allocate_resources(client, login, agency_data):
    request, inventory = agency_data["request1"], agency_data["inventory"]
    token = get_token(login, "donor@example.org")
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": inventory.id, "quantity": 5}, headers=bearer(token))
    assert response.status_code == 403

def test_allocation_rejects_invalid_quantity(client, login, agency_data):
    request, inventory = agency_data["request1"], agency_data["inventory"]
    request.stage = "Assessed"; db.session.commit()
    token = get_token(login, "agency1@example.org")
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": inventory.id, "quantity": 0}, headers=bearer(token))
    assert response.status_code == 400

def test_fully_allocated_request_updates_stage(client, login, agency_data):
    request, inventory = agency_data["request1"], agency_data["inventory"]
    request.stage = "Assessed"; request.quantity = 30; db.session.commit()
    token = get_token(login, "agency1@example.org")
    response = client.post("/api/matching/allocate", json={"requestId": request.id, "resourceId": inventory.id, "quantity": 20}, headers=bearer(token))
    assert response.status_code == 200
    data = response.get_json()
    assert data["remaining"] == 0
    assert data["totalAllocated"] == 30
    db.session.refresh(request); db.session.refresh(inventory)
    assert request.stage == "Allocated"
    assert inventory.quantity == 10

def test_agency_situation_report(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    response = client.get("/api/reports/situation", headers=bearer(token))
    assert response.status_code == 200
    data = response.get_json()
    assert data["totalRequests"] == 1
    assert data["confirmedRequests"] == 0
    assert data["byStage"]["Need identified"] == 1
    assert data["byCounty"]["Turkana"] == 1
    assert data["byCategory"]["Education"] == 1

def test_donor_cannot_access_situation_reports(client, login, agency_data):
    token = get_token(login, "donor@example.org")
    response = client.get("/api/reports/situation", headers=bearer(token))
    assert response.status_code == 403

def test_situation_reports_require_authentication(client):
    response = client.get("/api/reports/situation")
    assert response.status_code == 401

def test_assessment_needs_info_can_be_finalized(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    request = agency_data["request1"]
    url = f"/api/requests/{request.id}/assessment"
    response = client.post(url, json={"outcome": "needs_info", "priority": "High", "notes": "Additional documents required"}, headers=bearer(token))
    assert response.status_code == 201
    db.session.refresh(request)
    assert request.stage == "Need identified"
    response = client.patch(url, json={"outcome": "approved", "priority": "High", "notes": "Documents verified"}, headers=bearer(token))
    assert response.status_code == 200
    db.session.refresh(request)
    assert request.stage == "Published"
    response = client.post(url, json={"outcome": "approved", "priority": "High"}, headers=bearer(token))
    assert response.status_code == 409

def test_rejected_assessment_cannot_be_changed(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    request = agency_data["request1"]
    url = f"/api/requests/{request.id}/assessment"
    response = client.post(url, json={"outcome": "rejected", "priority": "Normal"}, headers=bearer(token))
    assert response.status_code == 201
    response = client.patch(url, json={"outcome": "approved", "priority": "High"}, headers=bearer(token))
    assert response.status_code == 409
    db.session.refresh(request)
    assert request.stage == "Need identified"

def test_delivery_requires_full_allocation(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    request = agency_data["request1"]
    request.stage = "Assessed"; db.session.commit()
    response = client.post("/api/deliveries", json={"requestId": request.id}, headers=bearer(token))
    assert response.status_code == 409
    assert response.get_json()["error"]["code"] == "not_fully_allocated"

def test_duplicate_active_delivery_is_rejected(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    request = agency_data["request1"]
    request.quantity = 10; request.stage = "Allocated"; db.session.commit()
    first = client.post("/api/deliveries", json={"requestId": request.id}, headers=bearer(token))
    second = client.post("/api/deliveries", json={"requestId": request.id}, headers=bearer(token))
    assert first.status_code == 201
    assert second.status_code == 409

def test_failed_delivery_allows_retry(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    request = agency_data["request1"]
    request.quantity = 10; request.stage = "Allocated"; db.session.commit()
    first = client.post("/api/deliveries", json={"requestId": request.id}, headers=bearer(token))
    assert first.status_code == 201
    delivery_id = first.get_json()["delivery"]["id"]
    for status in ["assigned", "failed"]:
        response = client.patch(f"/api/deliveries/{delivery_id}", json={"status": status}, headers=bearer(token))
        assert response.status_code == 200
    retry = client.post("/api/deliveries", json={"requestId": request.id}, headers=bearer(token))
    assert retry.status_code == 201
    assert retry.get_json()["delivery"]["id"] != delivery_id

def test_invalid_assessment_outcome_is_rejected(client, login, agency_data):
    token = get_token(login, "agency1@example.org")
    request = agency_data["request1"]

    response = client.post(
        f"/api/requests/{request.id}/assessment",
        json={"outcome": "unknown", "priority": "High"},
        headers=bearer(token)
    )

    assert response.status_code == 400