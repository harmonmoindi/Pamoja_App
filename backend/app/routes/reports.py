from collections import Counter

from flask import Blueprint, jsonify
from sqlalchemy import select

from app.extensions import db
from app.models.assistance_request import AssistanceRequest
from app.models.organization import Organization
from app.models.receipt_confirmation import ReceiptConfirmation
from app.utils.decorators import get_current_user, role_required


bp = Blueprint("reports", __name__)


@bp.get("/api/reports/situation")
@role_required("agency")
def situation_report():

    user = get_current_user()

    # Retrieve requests assigned to this agency.
    requests = db.session.scalars(
        select(AssistanceRequest)
        .join(
            Organization,
            AssistanceRequest.organization_id == Organization.id
        )
        .where(Organization.owner_id == user.id)
    ).all()

    request_ids = [request.id for request in requests]

    # Count requests with confirmed complete receipts.
    confirmed_ids = set()

    if request_ids:
        confirmed_ids = set(
            db.session.scalars(
                select(ReceiptConfirmation.request_id)
                .where(
                    ReceiptConfirmation.request_id.in_(request_ids),
                    ReceiptConfirmation.outcome == "complete"
                )
            ).all()
        )

    # Aggregate request statistics.
    by_stage = Counter(request.stage for request in requests)
    by_county = Counter(request.county for request in requests)
    by_category = Counter(request.category for request in requests)
    by_priority = Counter(
        request.priority or request.urgency
        for request in requests
    )

    return jsonify({
        "totalRequests": len(requests),
        "confirmedRequests": len(confirmed_ids),
        "byStage": dict(by_stage),
        "byCounty": dict(by_county),
        "byCategory": dict(by_category),
        "byPriority": dict(by_priority)
    }), 200