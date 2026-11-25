from app.extensions import db
from app.models.organization import Organization
from app.models.collection_centre import CollectionCentre
from tests.conftest import bearer

def test_public_can_list_centres(client):
    response = client.get("/api/centres")

    assert response.status_code == 200

    data = response.get_json()

    assert "items" in data
    assert "total" in data
    assert data["total"] == 0
    assert data["items"] == []

def test_unauthenticated_user_cannot_create_centre(client):
    response = client.post(
        "/api/centres",
        json={
            "name": "Kasarani Collection Centre",
            "county": "Nairobi",
            "generalArea": "Kasarani",
            "openingHours": "Monday-Friday, 8 AM-5 PM",
            "categories": ["Food", "Clothing"]
        }
    )

    assert response.status_code == 401

def test_agency_can_create_centre(client, login, make_user):
    agency = make_user(
        role="agency",
        email="centre-agency@example.org"
    )

    organization = Organization(
        name="Kasarani Humanitarian Agency",
        categories=["Food", "Clothing"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=agency.id
    )

    db.session.add(organization)
    db.session.commit()

    login_response = login("centre-agency@example.org")
    assert login_response.status_code == 200

    token = login_response.get_json()["token"]

    response = client.post(
        "/api/centres",
        json={
            "name": "Kasarani Collection Centre",
            "county": "Nairobi",
            "generalArea": "Kasarani",
            "openingHours": "Monday-Friday, 8 AM-5 PM",
            "categories": ["Food", "Clothing"]
        },
        headers=bearer(token)
    )

    assert response.status_code == 201, response.get_json()

    data = response.get_json()["centre"]

    assert data["name"] == "Kasarani Collection Centre"
    assert data["county"] == "Nairobi"
    assert data["generalArea"] == "Kasarani"
    assert data["organizationId"] == organization.id

    centre = db.session.get(CollectionCentre, data["id"])

    assert centre is not None
    assert centre.organization_id == organization.id
    assert centre.name == "Kasarani Collection Centre"

def test_donor_cannot_create_centre(client, login, make_user):
    make_user(role="donor", email="centre-donor@example.org")

    login_response = login("centre-donor@example.org")
    assert login_response.status_code == 200

    token = login_response.get_json()["token"]

    response = client.post(
        "/api/centres",
        json={
            "name": "Kasarani Collection Centre",
            "county": "Nairobi",
            "generalArea": "Kasarani",
            "openingHours": "Monday-Friday, 8 AM-5 PM",
            "categories": ["Food", "Clothing"]
        },
        headers=bearer(token)
    )

    assert response.status_code == 403

def test_agency_can_update_own_centre(client, login, make_user):
    agency = make_user(role="agency", email="update-agency@example.org")

    organization = Organization(
        name="Nairobi Humanitarian Agency",
        categories=["Food", "Clothing"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=agency.id
    )

    db.session.add(organization)
    db.session.flush()

    centre = CollectionCentre(
        organization_id=organization.id,
        name="Kasarani Collection Centre",
        county="Nairobi",
        general_area="Kasarani",
        opening_hours="Monday-Friday, 8 AM-5 PM",
        categories=["Food", "Clothing"]
    )

    db.session.add(centre)
    db.session.commit()

    login_response = login("update-agency@example.org")
    assert login_response.status_code == 200

    token = login_response.get_json()["token"]

    response = client.patch(
        f"/api/centres/{centre.id}",
        json={
            "openingHours": "Monday-Saturday, 8 AM-6 PM",
            "categories": ["Food", "Clothing", "Education"]
        },
        headers=bearer(token)
    )

    assert response.status_code == 200, response.get_json()

    data = response.get_json()["centre"]

    assert data["openingHours"] == "Monday-Saturday, 8 AM-6 PM"
    assert data["categories"] == ["Food", "Clothing", "Education"]
    assert data["name"] == "Kasarani Collection Centre"

    db.session.refresh(centre)

    assert centre.opening_hours == "Monday-Saturday, 8 AM-6 PM"
    assert centre.categories == ["Food", "Clothing", "Education"]
    assert centre.organization_id == organization.id

def test_agency_cannot_update_another_agencys_centre(client, login, make_user):
    agency1 = make_user(role="agency", email="agency-owner@example.org")
    agency2 = make_user(role="agency", email="agency-other@example.org")

    org1 = Organization(
        name="Nairobi Relief Organisation",
        categories=["Food"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=agency1.id
    )

    org2 = Organization(
        name="Community Support Kenya",
        categories=["Clothing"],
        counties=["Kiambu"],
        verification_status="verified",
        owner_id=agency2.id
    )

    db.session.add_all([org1, org2])
    db.session.flush()

    centre = CollectionCentre(
        organization_id=org1.id,
        name="Kasarani Collection Centre",
        county="Nairobi",
        general_area="Kasarani",
        opening_hours="Monday-Friday, 8 AM-5 PM",
        categories=["Food"]
    )

    db.session.add(centre)
    db.session.commit()

    login_response = login("agency-other@example.org")
    assert login_response.status_code == 200

    token = login_response.get_json()["token"]

    response = client.patch(
        f"/api/centres/{centre.id}",
        json={"name": "Unauthorized Centre Update"},
        headers=bearer(token)
    )

    assert response.status_code == 404

    db.session.refresh(centre)

    assert centre.name == "Kasarani Collection Centre"
    assert centre.organization_id == org1.id

def test_agency_cannot_create_centre_with_invalid_data(client, login, make_user):
    agency = make_user(role="agency", email="invalid-centre@example.org")

    organization = Organization(
        name="Invalid Centre Test Agency",
        categories=["Food"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=agency.id
    )

    db.session.add(organization)
    db.session.commit()

    login_response = login("invalid-centre@example.org")
    assert login_response.status_code == 200

    token = login_response.get_json()["token"]

    response = client.post(
        "/api/centres",
        json={
            "name": "",
            "county": "Nairobi",
            "generalArea": "",
            "openingHours": "Monday-Friday, 8 AM-5 PM",
            "categories": []
        },
        headers=bearer(token)
    )

    assert response.status_code == 400

def test_agency_cannot_update_centre_with_empty_data(client, login, make_user):
    agency = make_user(role="agency", email="empty-update@example.org")

    organization = Organization(
        name="Nairobi Community Agency",
        categories=["Food"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=agency.id
    )

    db.session.add(organization)
    db.session.flush()

    centre = CollectionCentre(
        organization_id=organization.id,
        name="Kasarani Collection Centre",
        county="Nairobi",
        general_area="Kasarani",
        opening_hours="Monday-Friday, 8 AM-5 PM",
        categories=["Food"]
    )

    db.session.add(centre)
    db.session.commit()

    login_response = login("empty-update@example.org")
    assert login_response.status_code == 200

    token = login_response.get_json()["token"]

    response = client.patch(
        f"/api/centres/{centre.id}",
        json={},
        headers=bearer(token)
    )

    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "validation_error"

    db.session.refresh(centre)

    assert centre.name == "Kasarani Collection Centre"
    assert centre.opening_hours == "Monday-Friday, 8 AM-5 PM"