"""Demo users and agencies. Matches the mock data the front-end used, so screens look the same.

Every seeded account has the same password (SEED_PASSWORD in .env, default Pamoja#2026).
Demo logins:  donor amina.hassan@example.org  |  beneficiary grace.wanjiku@example.org
              agency daniel.mutua@example.org  |  admin admin@example.org
"""
import os
from datetime import datetime

from sqlalchemy import select

from app.extensions import db
from app.models.organization import CHECKLIST_ITEMS, Organization
from app.models.user import User

# name, email, role, status, county, joined, last active
USERS = [
    ("Amina Hassan", "amina.hassan@example.org", "donor", "active", "Nairobi County", "2026-08-14", "2026-11-18"),
    ("Peter Otieno", "peter.otieno@example.org", "donor", "active", "Kisumu County", "2026-09-03", "2026-11-17"),
    ("Grace Wanjiku", "grace.wanjiku@example.org", "beneficiary", "active", "Nairobi County", "2026-09-21", "2026-11-16"),
    ("Joseph Lokiru", "joseph.lokiru@example.org", "beneficiary", "active", "Turkana County", "2026-10-02", "2026-11-12"),
    ("Halima Abdi", "halima.abdi@example.org", "beneficiary", "pending", "Garissa County", "2026-11-16", "2026-11-16"),
    ("Faith Achieng", "faith.achieng@example.org", "agency", "active", "Kisumu County", "2026-09-02", "2026-11-18"),
    ("Daniel Mutua", "daniel.mutua@example.org", "agency", "active", "Turkana County", "2026-08-21", "2026-11-17"),
    ("Samuel Kiptoo", "samuel.kiptoo@example.org", "donor", "suspended", "Nairobi County", "2026-07-30", "2026-10-29"),
    ("Mercy Njeri", "mercy.njeri@example.org", "agency", "pending", "Nairobi County", "2026-11-15", "2026-11-15"),
    ("Pamoja Admin", "admin@example.org", "admin", "active", "Nairobi County", "2026-06-01", "2026-11-18"),
]

T, F = True, False

# name, categories, counties, status, note, submitted, owner email, checklist ticks (4 items)
AGENCIES = [
    ("Community Health Access Kenya", ["Healthcare"], ["Nairobi County", "Kiambu County"], "pending", None, "2026-11-15", "mercy.njeri@example.org", [T, T, T, F]),
    ("Northern Learning Initiative", ["Education", "Community Support"], ["Turkana County", "Marsabit County"], "pending", None, "2026-11-13", None, [T, T, F, F]),
    ("Lake Region Relief Network", ["Shelter", "Food Security"], ["Kisumu County", "Homa Bay County"], "re-review", "Information updated", "2026-11-10", "faith.achieng@example.org", [T, T, T, T]),
    ("Kitui Health Outreach", ["Healthcare"], ["Kitui County"], "more-info", "Awaiting safeguarding contact", "2026-11-06", None, [T, T, T, F]),
    ("Pamoja Demo Education Partner", ["Education"], ["Turkana County"], "verified", None, "2026-08-21", "daniel.mutua@example.org", [T, T, T, T]),
    ("Pamoja Demo Resilience Partner", ["Food Security", "Shelter"], ["Marsabit County", "Garissa County"], "verified", None, "2026-09-02", None, [T, T, T, T]),
    ("Garissa Community Support Trust", ["Community Support", "Food Security"], ["Garissa County"], "verified", None, "2026-09-19", None, [T, T, T, T]),
]


def _checklist(ticks):
    return [{"label": label, "done": done} for label, done in zip(CHECKLIST_ITEMS, ticks)]


def run():
    password = os.getenv("SEED_PASSWORD", "Pamoja#2026")

    for name, email, role, status, county, joined, last_active in USERS:
        if db.session.scalar(select(User).where(User.email == email)):
            continue
        user = User(
            name=name, email=email, role=role, status=status, county=county,
            created_at=datetime.fromisoformat(joined), last_active_at=datetime.fromisoformat(last_active),
        )
        user.set_password(password)
        db.session.add(user)
    db.session.flush()

    for name, categories, counties, status, note, submitted, owner_email, ticks in AGENCIES:
        existing = db.session.scalar(select(Organization).where(Organization.name == name))
        if existing:
            if existing.checklist is None:  # seeded before the review checklist existed
                existing.checklist = _checklist(ticks)
            continue
        owner = db.session.scalar(select(User).where(User.email == owner_email)) if owner_email else None
        db.session.add(Organization(
            name=name, categories=categories, counties=counties, verification_status=status, note=note,
            submitted_at=datetime.fromisoformat(submitted), owner_id=owner.id if owner else None,
            checklist=_checklist(ticks),
        ))
