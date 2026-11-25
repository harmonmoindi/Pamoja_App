"""Finds assistance requests that look alike so an admin can review them.

A flag is only a prompt for a human decision. Two requests from the same area can be perfectly legitimate.
"""
import re
from datetime import timedelta

from sqlalchemy import select

from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.duplicate_flag import DuplicateFlag
from app.services import audit_service

WINDOW = timedelta(hours=48)
MIN_SIGNALS = 3  # the two base signals (same category and area) plus at least one more


def _words(text):
    return set(re.findall(r"[a-z0-9]+", (text or "").lower()))


def _similar_titles(a_title, b_title) -> bool:
    a, b = _words(a_title), _words(b_title)
    if not a or not b:
        return False
    return len(a & b) / len(a | b) >= 0.5


def signals_for(a, b):
    """Returns the list of shared signals, or an empty list when the pair is not worth flagging."""
    if a.category != b.category or a.county != b.county:
        return []
    signals = ["Same category", "Same general area"]
    if a.beneficiary_id == b.beneficiary_id:
        signals.append("Same beneficiary account")
    if abs(a.created_at - b.created_at) <= WINDOW:
        signals.append("Submitted within 48 hours")
    if (a.resource or "").strip().lower() == (b.resource or "").strip().lower():
        signals.append("Same resource requested")
    if _similar_titles(a.title, b.title):
        signals.append("Similar title")
    return signals if len(signals) >= MIN_SIGNALS else []


def scan_for_duplicates(actor=None) -> int:
    """Compares all requests, saves a DuplicateFlag for each new similar pair, and returns how many were created.
    Safe to run again: pairs that already have a flag are skipped."""
    requests = db.session.scalars(select(AssistanceRequest).order_by(AssistanceRequest.id)).all()
    existing = {(f.request_a_id, f.request_b_id) for f in db.session.scalars(select(DuplicateFlag))}

    created = 0
    for i, a in enumerate(requests):
        for b in requests[i + 1:]:  # requests are ordered by id, so a.id < b.id
            if (a.id, b.id) in existing:
                continue
            signals = signals_for(a, b)
            if not signals:
                continue
            flag = DuplicateFlag(request_a_id=a.id, request_b_id=b.id, signals=signals)
            db.session.add(flag)
            db.session.flush()
            audit_service.log_event(
                "safety",
                "Possible duplicate flagged",
                f"{a.reference or '#' + str(a.id)} and {b.reference or '#' + str(b.id)} share {len(signals)} signals",
                actor=actor,
                entity_type="duplicate_flag",
                entity_id=flag.id,
                commit=False,
            )
            created += 1

    db.session.commit()
    return created