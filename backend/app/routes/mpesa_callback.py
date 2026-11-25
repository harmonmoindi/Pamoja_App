
from decimal import Decimal

from flask import Blueprint, jsonify, request
from sqlalchemy import select

from app.extensions import db
from app.models.donation import Donation
from app.services import audit_service
from app.services.notification_service import notify


bp = Blueprint(
    "mpesa_callback",
    __name__,
    url_prefix="/api/mpesa",
)


def _get_callback_value(items, name):
    """Find a value in the M-Pesa callback metadata."""

    for item in items:
        if item.get("Name") == name:
            return item.get("Value")

    return None


@bp.post("/callback")
def mpesa_callback():
    """Receive and process an M-Pesa STK Push callback."""

    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "ResultCode": 1,
            "ResultDesc": "Invalid callback body",
        }), 400

    body = payload.get("Body", {})
    callback = body.get("stkCallback", {})

    checkout_request_id = callback.get("CheckoutRequestID")

    if not checkout_request_id:
        return jsonify({
            "ResultCode": 1,
            "ResultDesc": "Missing checkout request ID",
        }), 400

    donation = db.session.scalar(
        select(Donation).where(
            Donation.checkout_request_id == checkout_request_id
        )
    )

    if donation is None:
        # Acknowledge the callback but do not update an unknown donation.
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Callback received",
        }), 200

    # Ignore duplicate callbacks for transactions already completed.
    if donation.status in ("successful", "failed"):
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Callback already processed",
        }), 200

    result_code = callback.get("ResultCode")
    result_description = callback.get(
        "ResultDesc",
        "M-Pesa payment result received",
    )

    donation.result_code = (
        str(result_code) if result_code is not None else None
    )
    donation.result_description = result_description

    if str(result_code) == "0":
        metadata = (
            callback.get("CallbackMetadata", {}).get("Item", [])
        )

        receipt = _get_callback_value(
            metadata,
            "MpesaReceiptNumber",
        )

        callback_amount = _get_callback_value(
            metadata,
            "Amount",
        )

        try:
            amount_matches = (
                callback_amount is not None
                and Decimal(str(callback_amount))
                == Decimal(str(donation.amount))
            )
        except Exception:
            amount_matches = False

        # Do not mark a transaction successful without a receipt
        # and an amount matching the original donation.
        if receipt and amount_matches:
            existing_receipt = db.session.scalar(
                select(Donation).where(
                    Donation.mpesa_receipt == str(receipt)
                )
            )

            if (
                existing_receipt is None
                or existing_receipt.id == donation.id
            ):
                donation.mpesa_receipt = str(receipt)
                donation.status = "successful"
            else:
                donation.status = "failed"
                donation.result_description = (
                    "The payment receipt is already associated "
                    "with another donation."
                )
        else:
            donation.status = "failed"
            donation.result_description = (
                "The payment callback did not contain a valid "
                "receipt and matching amount."
            )

    else:
        donation.status = "failed"

    audit_service.log_event(
        "user",
        "M-Pesa payment update",
        (
            f"{donation.reference}: "
            f"{donation.status} - "
            f"{donation.result_description}"
        ),
        actor=None,
        actor_label="M-Pesa callback",
        entity_type="donation",
        entity_id=donation.id,
        commit=False,
    )

    if donation.status == "successful":
        notify(
            donation.donor_id,
            "Donation successful",
            (
                f"Your donation of KES {donation.amount} "
                "has been confirmed."
            ),
            kind="payment",
            commit=False,
        )
    else:
        notify(
            donation.donor_id,
            "Donation payment unsuccessful",
            donation.result_description,
            kind="payment",
            commit=False,
        )

    db.session.commit()

    return jsonify({
        "ResultCode": 0,
        "ResultDesc": "Callback processed",
    }), 200
