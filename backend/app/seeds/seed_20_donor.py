
"""Demo opportunities, donor profiles and collection centres.

Safe to run more than once. Uses the demo users and organizations
created by seed_01_core.py and assistance requests from
seed_30_beneficiary.py.
"""

from sqlalchemy import select

from app.extensions import db
from app.models.collection_centre import CollectionCentre
from app.models.donor_profile import DonorProfile
from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.models.user import User
from app.models.assistance_request import AssistanceRequest


OPPORTUNITIES = [
    {
        "title": "Food packages for vulnerable households",
        "category": "Food",
        "county": "Garissa",
        "description": (
            "Provide essential food packages to households "
            "experiencing food insecurity."
        ),
        "urgency": "High",
        "target_qty": 100,
        "stage": "Published",
        "organization": "Garissa Community Support Trust",
        "request_title": "Food assistance for vulnerable households",
    },
    {
        "title": "School supplies for students in Turkana",
        "category": "Education",
        "county": "Turkana",
        "description": (
            "Help provide exercise books and essential learning "
            "materials for students."
        ),
        "urgency": "High",
        "target_qty": 500,
        "stage": "Published",
        "organization": "Pamoja Demo Education Partner",
        "request_title": "School supplies for students in Turkana",
    },
    {
        "title": "Emergency shelter support in Kisumu",
        "category": "Shelter",
        "county": "Kisumu",
        "description": (
            "Support access to temporary shelter materials "
            "for households in need."
        ),
        "urgency": "Medium",
        "target_qty": 50,
        "stage": "Published",
        "organization": "Lake Region Relief Network",
        "request_title": "Emergency shelter support in Kisumu",
    },
    {
        "title": "Community medical outreach supplies",
        "category": "Medical",
        "county": "Nairobi",
        "description": (
            "Help community health teams obtain essential "
            "medical outreach supplies."
        ),
        "urgency": "High",
        "target_qty": 60,
        "stage": "Published",
        "organization": "Community Health Access Kenya",
        "request_title": "Medical supplies for community outreach",
    },
]


CENTRES = [
    {
        "name": "Nairobi Community Collection Centre",
        "county": "Nairobi County",
        "general_area": "Westlands",
        "opening_hours": {
            "Monday-Friday": "08:00-17:00",
            "Saturday": "09:00-13:00",
            "Sunday": "Closed",
        },
        "categories": ["Food", "Clothing", "Education", "Other"],
        "organization": "Community Health Access Kenya",
    },
    {
        "name": "Kisumu Community Collection Centre",
        "county": "Kisumu County",
        "general_area": "Kisumu Central",
        "opening_hours": {
            "Monday-Friday": "08:00-17:00",
            "Saturday": "09:00-13:00",
            "Sunday": "Closed",
        },
        "categories": ["Food", "Shelter", "Clothing", "Other"],
        "organization": "Lake Region Relief Network",
    },
    {
        "name": "Turkana Community Collection Centre",
        "county": "Turkana County",
        "general_area": "Lodwar",
        "opening_hours": {
            "Monday-Friday": "08:00-16:00",
            "Saturday": "09:00-12:00",
            "Sunday": "Closed",
        },
        "categories": ["Food", "Water", "Education", "Shelter"],
        "organization": "Pamoja Demo Education Partner",
    },
]


DONOR_PROFILES = [
    "amina.hassan@example.org",
    "peter.otieno@example.org",
]


def _get_organization(name):
    return db.session.scalar(
        select(Organization).where(Organization.name == name)
    )


def _seed_opportunities():
    for item in OPPORTUNITIES:
        organization = _get_organization(item["organization"])

        assistance_request = db.session.scalar(
            select(AssistanceRequest).where(
                AssistanceRequest.title == item["request_title"]
            )
        )

        existing = db.session.scalar(
            select(Opportunity).where(
                Opportunity.title == item["title"]
            )
        )

        if existing:
            # Fill missing links when the beneficiary request
            # was created after this opportunity.
            if existing.request_id is None and assistance_request:
                existing.request_id = assistance_request.id

            if existing.organization_id is None and organization:
                existing.organization_id = organization.id

            continue

        opportunity = Opportunity(
            title=item["title"],
            category=item["category"],
            county=item["county"],
            description=item["description"],
            urgency=item["urgency"],
            target_qty=item["target_qty"],
            pledged_qty=0,
            stage=item["stage"],
            organization_id=organization.id if organization else None,
            request_id=(
                assistance_request.id
                if assistance_request
                else None
            ),
        )

        db.session.add(opportunity)


def _seed_centres():
    for item in CENTRES:
        existing = db.session.scalar(
            select(CollectionCentre).where(
                CollectionCentre.name == item["name"]
            )
        )

        if existing:
            continue

        organization = _get_organization(item["organization"])

        centre = CollectionCentre(
            name=item["name"],
            county=item["county"],
            general_area=item["general_area"],
            opening_hours=item["opening_hours"],
            categories=item["categories"],
            organization_id=organization.id if organization else None,
        )

        db.session.add(centre)


def _seed_donor_profiles():
    for email in DONOR_PROFILES:
        donor = db.session.scalar(
            select(User).where(
                User.email == email,
                User.role == "donor",
            )
        )

        if donor is None:
            continue

        existing = db.session.scalar(
            select(DonorProfile).where(
                DonorProfile.user_id == donor.id
            )
        )

        if existing:
            continue

        profile = DonorProfile(
            user_id=donor.id,
            preferences={},
            notification_settings={
                "email": True,
                "inApp": True,
            },
        )

        db.session.add(profile)


def run():
    _seed_opportunities()
    _seed_centres()
    _seed_donor_profiles()

    db.session.flush()

    print("Donor demo data prepared successfully.")
