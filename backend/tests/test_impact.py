from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.delivery import Delivery
from app.models.organization import Organization
from app.models.pledge import Pledge
from app.models.receipt_confirmation import ReceiptConfirmation


def _request(beneficiary_id, stage, category="Education", county="Turkana County", allocated=0):
    req = AssistanceRequest(
        beneficiary_id=beneficiary_id, title=f"{category} request", category=category, county=county,
        summary="Support needed", resource="Supplies", quantity=10, stage=stage, allocated=allocated,
    )
    db.session.add(req)
    db.session.commit()
    return req


def test_impact_summary_is_public_and_counts_only_confirmed_deliveries(client, make_user):
    beneficiary = make_user(role="beneficiary", email="b@example.org", name="Beneficiary")
    org = Organization(name="Helping Hands")
    db.session.add(org)
    db.session.commit()

    _request(beneficiary.id, "Need identified")
    _request(beneficiary.id, "Pledged", category="Healthcare", county="Kisumu County")
    delivered = _request(beneficiary.id, "Delivered", allocated=8)

    delivery = Delivery(request_id=delivered.id, organization_id=org.id)
    db.session.add(delivery)
    db.session.commit()
    db.session.add(ReceiptConfirmation(
        delivery_id=delivery.id, request_id=delivered.id, beneficiary_id=beneficiary.id, outcome="complete",
    ))
    donor = make_user(role="donor", email="donor@example.org", name="Donor")
    # The test database does not enforce foreign keys, so a plain id is enough for opportunity_id
    db.session.add(Pledge(donor_id=donor.id, opportunity_id=1, pledge_type="in_kind", status="pending", quantity=3))
    db.session.add(Pledge(donor_id=donor.id, opportunity_id=1, pledge_type="in_kind", status="fulfilled", quantity=2))
    db.session.commit()

    res = client.get("/api/impact/summary")  # no token: the page is public
    assert res.status_code == 200
    body = res.get_json()

    metrics = {m["label"]: m for m in body["metrics"]}
    assert metrics["Requests submitted"]["value"] == "3"
    assert metrics["Requests approved"]["value"] == "2"       # Pledged and Delivered
    assert metrics["Active pledges"]["value"] == "1"          # only pending pledges
    assert metrics["Confirmed deliveries"]["value"] == "1"    # only a completed receipt

    counties = {c["county"]: c["count"] for c in body["countyRequests"]}
    assert counties == {"Turkana": 2, "Kisumu": 1}
    assert body["categoryOutput"] == [{"name": "Education", "units": 8, "value": 100}]
    assert body["commitmentProgress"]["coordinated"] == 67
    assert body["commitmentProgress"]["received"] == 33


def test_impact_summary_works_with_no_data(client):
    body = client.get("/api/impact/summary").get_json()
    assert body["metrics"][0]["value"] == "0"
    assert body["countyRequests"] == [] and body["categoryOutput"] == []
    assert body["commitmentProgress"]["coordinated"] == 0
