
from decimal import Decimal

from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.donation import Donation
from app.models.opportunity import Opportunity
from app.schemas.donation_schema import (
    DonationCreateSchema,
    DonationSchema,
)
from app.services import audit_service
from app.services.notification_service import notify
from app.services.mpesa_service import initiate_stk_push
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.reference_ids import make_reference
from app.utils.validators import parse_body


bp = Blueprint(
    "donations",
    __name__,
    url_prefix="/api/donations",
)


def _get_own_donation(donation_id, donor_id):
    """Find a donation belonging to the logged-in donor."""

    donation = db.session.scalar(
        select(Donation).where(
            Donation.id == donation_id,
            Donation.donor_id == donor_id,
        )
    )

    if donation is None:
        raise ApiError(
            404,
            "not_found",
            "Donation not found",
        )

    return donation


@bp.post("")
@role_required("donor")
def create_donation():
    """Create a donation and initiate an M-Pesa payment."""

    donor = get_current_user()
    data = parse_body(DonationCreateSchema())

    opportunity = None
    opportunity_id = data.get("opportunity_id")

    if opportunity_id is not None:
        opportunity = db.session.get(
            Opportunity,
            opportunity_id,
        )

        if opportunity is None:
            raise ApiError(
                404,
                "not_found",
                "Opportunity not found",
            )

        if opportunity.stage not in ("Published", "Pledged"):
            raise ApiError(
                409,
                "opportunity_unavailable",
                "This opportunity is not accepting donations",
            )

    amount = Decimal(str(data["amount"]))

    donation = Donation(
        donor_id=donor.id,
        opportunity_id=opportunity_id,
        amount=amount,
        phone=data["phone"],
        payment_method="M-Pesa",
        status="pending",
        is_simulated=False,
    )

    db.session.add(donation)
    db.session.flush()

    donation.reference = make_reference(
        "DON",
        donation.id,
    )

    try:
        payment_result = initiate_stk_push(
            phone=donation.phone,
            amount=donation.amount,
            reference=donation.reference,
        )

    except Exception:
        db.session.rollback()
        raise

    donation.is_simulated = payment_result["simulated"]
    donation.status = payment_result["status"]
    donation.checkout_request_id = (
        payment_result["checkout_request_id"]
    )
    donation.merchant_request_id = (
        payment_result["merchant_request_id"]
    )
    donation.result_code = payment_result["result_code"]
    donation.result_description = (
        payment_result["result_description"]
    )

    audit_service.log_event(
        "user",
        "Donation created",
        (
            f"{donation.reference}: "
            f"KES {donation.amount} "
            f"({donation.status})"
        ),
        actor=donor,
        entity_type="donation",
        entity_id=donation.id,
        commit=False,
    )

    notify(
        donor.id,
        "Donation payment update",
        payment_result["result_description"],
        kind="payment",
        commit=False,
    )

    db.session.commit()

    return jsonify({
        "donation": DonationSchema().dump(donation),
        "payment": {
            "status": donation.status,
            "message": donation.result_description,
            "amount": float(donation.amount),
            "date": donation.created_at.isoformat(),
            "transaction_code": donation.mpesa_receipt,
        },
    }), 201


@bp.get("/mine")
@role_required("donor")
def my_donations():
    """List donations belonging to the logged-in donor."""

    donor = get_current_user()

    stmt = (
        select(Donation)
        .where(Donation.donor_id == donor.id)
        .order_by(Donation.created_at.desc())
    )

    return jsonify(
        paginate(stmt, DonationSchema())
    )


@bp.get("/<int:donation_id>")
@role_required("donor")
def get_donation(donation_id):
    """Get one donation belonging to the logged-in donor."""

    donor = get_current_user()
    donation = _get_own_donation(
        donation_id,
        donor.id,
    )

    return jsonify({
        "donation": DonationSchema().dump(donation)
    })


@bp.get("/<int:donation_id>/status")
@role_required("donor")
def get_donation_status(donation_id):
    """Get the current payment status for a donor's donation."""

    donor = get_current_user()
    donation = _get_own_donation(
        donation_id,
        donor.id,
    )

    status_labels = {
        "pending": "Your payment is pending.",
        "processing": "Your payment is being processed.",
        "successful": "Your payment was successful.",
        "failed": "Your payment could not be completed.",
    }

    return jsonify({
        "payment": {
            "status": DonationSchema().dump(donation)["status"],
            "message": status_labels.get(
                donation.status,
                "Payment status is unavailable.",
            ),
            "transaction_code": donation.mpesa_receipt,
            "amount": float(donation.amount),
            "date": donation.created_at.isoformat(),
        }
    })
