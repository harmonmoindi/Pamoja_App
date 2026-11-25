from flask import Blueprint, jsonify
from sqlalchemy import func, select

from app.extensions import db
from app.models.assistance_request import AssistanceRequest as Req
from app.models.mixins import utcnow
from app.models.pledge import Pledge
from app.models.receipt_confirmation import ReceiptConfirmation

bp = Blueprint("impact", __name__, url_prefix="/api/impact")

# Stage names are the lifecycle stages used everywhere (frontend/src/data/constants/lifecycle.ts)
APPROVED = ("Published", "Pledged", "Allocated", "Delivered", "Confirmed")
COORDINATED = ("Pledged", "Allocated", "Delivered", "Confirmed")
RECEIVED = ("Delivered", "Confirmed")


def _count(*conditions) -> int:
    return db.session.scalar(select(func.count(Req.id)).where(*conditions)) or 0


@bp.get("/summary")
def summary():
    """Public statistics for the Impact page.
    Honesty rule: a pledge is never counted as delivered. Only a beneficiary's completed receipt counts as a confirmed delivery."""
    total = _count()
    month_start = utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month = _count(Req.created_at >= month_start)
    approved = _count(Req.stage.in_(APPROVED))

    active_pledges = db.session.scalar(select(func.count(Pledge.id)).where(Pledge.status == "pending")) or 0
    confirmed = db.session.scalar(
        select(func.count(ReceiptConfirmation.id)).where(ReceiptConfirmation.outcome == "complete")
    ) or 0

    def pct(n):
        return round(n / total * 100) if total else 0

    counties = db.session.execute(
        select(Req.county, func.count(Req.id))
        .group_by(Req.county)
        .order_by(func.count(Req.id).desc(), Req.county)
        .limit(5)
    ).all()

    delivered_units = db.session.execute(
        select(Req.category, func.coalesce(func.sum(Req.allocated), 0))
        .where(Req.stage.in_(RECEIVED))
        .group_by(Req.category)
        .order_by(Req.category)
    ).all()
    biggest = max((units for _, units in delivered_units), default=0)

    awaiting_units = db.session.scalar(
        select(func.coalesce(func.sum(Req.allocated), 0)).where(Req.stage == "Allocated")
    ) or 0

    return jsonify(
        {
            "metrics": [
                {"label": "Requests submitted", "value": f"{total:,}", "note": f"+{this_month} this month"},
                {"label": "Requests approved", "value": f"{approved:,}", "note": f"{pct(approved)}% reviewed"},
                {"label": "Active pledges", "value": f"{active_pledges:,}", "note": "Commitments, not deliveries"},
                {"label": "Confirmed deliveries", "value": f"{confirmed:,}", "note": "Beneficiary acknowledged"},
            ],
            "countyRequests": [
                {"county": county.replace(" County", ""), "count": count} for county, count in counties
            ],
            "categoryOutput": [
                {"name": category, "units": int(units), "value": round(units / biggest * 100) if biggest else 0}
                for category, units in delivered_units
            ],
            "commitmentProgress": {
                "coordinated": pct(_count(Req.stage.in_(COORDINATED))),
                "received": pct(_count(Req.stage.in_(RECEIVED))),
                "allocated": pct(_count(Req.stage == "Allocated")),
                "pledgedOnly": pct(_count(Req.stage == "Pledged")),
            },
            "awaitingDeliveryUnits": int(awaiting_units),
        }
    )
