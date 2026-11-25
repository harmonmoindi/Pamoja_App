from app.extensions import db
from app.models.inventory_item import InventoryItem
from app.models.organization import Organization
from tests.conftest import bearer


def _agency(make_user, email="agency@example.org"):
    owner = make_user(role="agency", email=email, name="Agency Owner")
    org = Organization(
        name="Demo Agency",
        categories=["Food Security"],
        counties=["Nairobi"],
        verification_status="verified",
        owner_id=owner.id,
    )
    db.session.add(org)
    db.session.commit()
    return owner, org


def _item(org, name="Food Packages", quantity=15):
    item = InventoryItem(
        organization_id=org.id,
        reference=f"PAM-INV-{org.id}-{name}",
        name=name,
        category="Food Supplies",
        county="Nairobi",
        quantity=quantity,
        unit="packages",
        minimum=5,
    )
    db.session.add(item)
    db.session.commit()
    return item


def test_agency_lists_only_own_inventory(client, make_user, login):
    _, org = _agency(make_user)
    _, other = _agency(make_user, email="other@example.org")
    own = _item(org, name="Food Packages")
    _item(other, name="Medical Kits")
    token = login("agency@example.org").get_json()["token"]

    res = client.get("/api/inventory", headers=bearer(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == own.id
    assert body["items"][0]["name"] == "Food Packages"
    assert body["items"][0]["organizationId"] == org.id


def test_beneficiary_cannot_list_inventory(client, make_user, login):
    make_user(role="beneficiary", email="grace@example.org", name="Grace")
    token = login("grace@example.org").get_json()["token"]

    res = client.get("/api/inventory", headers=bearer(token))

    assert res.status_code == 403


def test_agency_can_create_stock(client, make_user, login):
    _, org = _agency(make_user)
    token = login("agency@example.org").get_json()["token"]

    res = client.post(
        "/api/inventory",
        json={
            "name": "Shelter Kits",
            "category": "Shelter",
            "county": "Kajiado",
            "quantity": 3,
            "unit": "kits",
            "minimum": 5,
        },
        headers=bearer(token),
    )

    assert res.status_code == 201
    item = res.get_json()["item"]
    assert item["organizationId"] == org.id
    assert item["quantity"] == 3
    assert item["reference"].startswith("PAM-INV-")
    stored = db.session.get(InventoryItem, item["id"])
    assert stored.name == "Shelter Kits"


def test_create_stock_rejects_negative_quantity(client, make_user, login):
    _agency(make_user)
    token = login("agency@example.org").get_json()["token"]

    res = client.post(
        "/api/inventory",
        json={"name": "Blankets", "category": "Shelter", "county": "Nairobi", "quantity": -1},
        headers=bearer(token),
    )

    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "validation_error"


def test_agency_can_update_stock(client, make_user, login):
    _, org = _agency(make_user)
    item = _item(org, quantity=15)
    token = login("agency@example.org").get_json()["token"]

    res = client.patch(f"/api/inventory/{item.id}", json={"quantity": 9}, headers=bearer(token))

    assert res.status_code == 200
    assert res.get_json()["item"]["quantity"] == 9
    db.session.refresh(item)
    assert item.quantity == 9


def test_agency_cannot_update_another_agencys_stock(client, make_user, login):
    _agency(make_user)
    _, other = _agency(make_user, email="other@example.org")
    item = _item(other, quantity=7)
    token = login("agency@example.org").get_json()["token"]

    res = client.patch(f"/api/inventory/{item.id}", json={"quantity": 1}, headers=bearer(token))

    assert res.status_code == 404
    db.session.refresh(item)
    assert item.quantity == 7


def test_update_stock_rejects_negative_quantity(client, make_user, login):
    _, org = _agency(make_user)
    item = _item(org, quantity=4)
    token = login("agency@example.org").get_json()["token"]

    res = client.patch(f"/api/inventory/{item.id}", json={"quantity": -2}, headers=bearer(token))

    assert res.status_code == 400
    db.session.refresh(item)
    assert item.quantity == 4
