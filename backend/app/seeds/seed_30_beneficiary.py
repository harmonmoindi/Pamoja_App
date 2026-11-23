"""Demo assistance requests for beneficiary screens. Safe to run twice."""
from datetime import datetime

from sqlalchemy import select

from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from app.models.user import User
from app.utils.reference_ids import make_reference

# Matches frontend/src/data/mock/beneficiaryRequests.ts and admin oversight samples.
REQUESTS = [
    # reference suffix uses id after flush; seed sets fields then assigns PAM-REQ-*
    {
        "email": "grace.wanjiku@example.org",
        "org": "Pamoja Demo Education Partner",
        "title": "School supplies for students in Turkana",
        "category": "Education",
        "county": "Turkana",
        "summary": "Help a community learning centre prepare 50 students for the new term with essential school materials.",
        "resource": "Exercise books",
        "quantity": 500,
        "unit": "packs",
        "urgency": "High",
        "stage": "Assessed",
        "priority": "High priority",
        "created": "2026-11-06",
    },
    {
        "email": "grace.wanjiku@example.org",
        "org": "Garissa Community Support Trust",
        "title": "Food assistance for vulnerable households",
        "category": "Food Security",
        "county": "Garissa",
        "summary": "Household food packages for a fictional request in Garissa.",
        "resource": "Food parcels",
        "quantity": 80,
        "unit": "packages",
        "urgency": "High",
        "stage": "Pledged",
        "priority": "High priority",
        "created": "2026-11-09",
    },
    {
        "email": "joseph.lokiru@example.org",
        "org": "Community Health Access Kenya",
        "title": "Medical supplies for community outreach",
        "category": "Healthcare",
        "county": "Nairobi",
        "summary": "Basic clinic supplies for a fictional community outreach day in Nairobi.",
        "resource": "Medical kits",
        "quantity": 60,
        "unit": "kits",
        "urgency": "High",
        "stage": "Delivered",
        "priority": "Urgent",
        "created": "2026-11-12",
    },
    {
        "email": "joseph.lokiru@example.org",
        "org": "Lake Region Relief Network",
        "title": "Emergency shelter support in Kisumu",
        "category": "Shelter",
        "county": "Kisumu",
        "summary": "Temporary shelter materials recorded for a fictional response in Kisumu.",
        "resource": "Shelter kits",
        "quantity": 25,
        "unit": "kits",
        "urgency": "High",
        "stage": "Confirmed",
        "priority": "Urgent",
        "created": "2026-11-14",
    },
]


def run():
    for item in REQUESTS:
        if db.session.scalar(
            select(AssistanceRequest).where(AssistanceRequest.title == item["title"])
        ):
            continue

        beneficiary = db.session.scalar(select(User).where(User.email == item["email"]))
        organization = db.session.scalar(select(Organization).where(Organization.name == item["org"]))
        if beneficiary is None:
            continue

        request = AssistanceRequest(
            beneficiary_id=beneficiary.id,
            organization_id=organization.id if organization else None,
            title=item["title"],
            category=item["category"],
            county=item["county"],
            summary=item["summary"],
            resource=item["resource"],
            quantity=item["quantity"],
            allocated=0,
            unit=item["unit"],
            urgency=item["urgency"],
            stage=item["stage"],
            priority=item["priority"],
            created_at=datetime.fromisoformat(item["created"]),
            updated_at=datetime.fromisoformat(item["created"]),
        )
        db.session.add(request)
        db.session.flush()
        request.reference = make_reference("REQ", request.id)
