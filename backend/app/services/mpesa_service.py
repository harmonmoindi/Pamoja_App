
import base64
import os
from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

import requests

from app.errors import ApiError


def _get_settings():
    """Read M-Pesa settings from environment variables."""

    environment = os.getenv(
        "MPESA_ENVIRONMENT",
        "sandbox",
    ).strip().lower()

    if environment not in ("sandbox", "production"):
        raise ApiError(
            500,
            "mpesa_configuration_error",
            "MPESA_ENVIRONMENT must be sandbox or production",
        )

    settings = {
        "consumer_key": os.getenv("MPESA_CONSUMER_KEY"),
        "consumer_secret": os.getenv("MPESA_CONSUMER_SECRET"),
        "shortcode": os.getenv("MPESA_SHORTCODE"),
        "passkey": os.getenv("MPESA_PASSKEY"),
        "callback_url": os.getenv("MPESA_CALLBACK_URL"),
        "environment": environment,
    }

    return settings


def _is_configured(settings):
    """Check whether all required Daraja settings are available."""

    required = (
        "consumer_key",
        "consumer_secret",
        "shortcode",
        "passkey",
        "callback_url",
    )

    return all(settings.get(key) for key in required)


def _base_url(environment):
    if environment == "production":
        return "https://api.safaricom.co.ke"

    return "https://sandbox.safaricom.co.ke"


def _get_access_token(settings):
    """Request an OAuth access token from Daraja."""

    url = (
        f"{_base_url(settings['environment'])}"
        "/oauth/v1/generate?grant_type=client_credentials"
    )

    try:
        response = requests.get(
            url,
            auth=(
                settings["consumer_key"],
                settings["consumer_secret"],
            ),
            timeout=20,
        )

        response.raise_for_status()
        data = response.json()

    except (requests.RequestException, ValueError):
        raise ApiError(
            502,
            "mpesa_connection_error",
            "Could not authenticate with the M-Pesa service",
        )

    access_token = data.get("access_token")

    if not access_token:
        raise ApiError(
            502,
            "mpesa_authentication_error",
            "M-Pesa did not return an access token",
        )

    return access_token


def _normalize_phone(phone):
    """Convert a Kenyan mobile number to 254XXXXXXXXX format."""

    phone = str(phone).strip().replace(" ", "").replace("-", "")

    if phone.startswith("+254"):
        phone = phone[1:]

    elif phone.startswith("0"):
        phone = "254" + phone[1:]

    elif phone.startswith(("7", "1")) and len(phone) == 9:
        phone = "254" + phone

    if (
        len(phone) != 12
        or not phone.startswith("254")
        or not phone[3:].isdigit()
    ):
        raise ApiError(
            400,
            "invalid_phone",
            "Enter a valid Kenyan mobile number",
        )

    return phone


def initiate_stk_push(phone, amount, reference):
    """Initiate an M-Pesa STK Push.

    When Daraja settings are missing, return a simulated pending
    transaction. A simulated transaction is never marked successful.
    """

    settings = _get_settings()

    if not _is_configured(settings):
        return {
            "simulated": True,
            "status": "pending",
            "checkout_request_id": None,
            "merchant_request_id": None,
            "result_code": None,
            "result_description": (
                "Simulated transaction. No M-Pesa payment was made."
            ),
        }

    phone = _normalize_phone(phone)
    amount = Decimal(str(amount))

    if amount <= 0 or amount != amount.to_integral_value():
        raise ApiError(
            400,
            "invalid_amount",
            "M-Pesa donations must be whole amounts in Kenyan shillings",
        )

    timestamp = datetime.now(
        ZoneInfo("Africa/Nairobi")
    ).strftime("%Y%m%d%H%M%S")

    password_text = (
        settings["shortcode"]
        + settings["passkey"]
        + timestamp
    )

    password = base64.b64encode(
        password_text.encode("utf-8")
    ).decode("utf-8")

    access_token = _get_access_token(settings)

    url = (
        f"{_base_url(settings['environment'])}"
        "/mpesa/stkpush/v1/processrequest"
    )

    payload = {
        "BusinessShortCode": settings["shortcode"],
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": settings["shortcode"],
        "PhoneNumber": phone,
        "CallBackURL": settings["callback_url"],
        "AccountReference": reference,
        "TransactionDesc": "Pamoja Donation",
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30,
        )

        response.raise_for_status()
        data = response.json()

    except (requests.RequestException, ValueError):
        return {
            "simulated": False,
            "status": "failed",
            "checkout_request_id": None,
            "merchant_request_id": None,
            "result_code": None,
            "result_description": (
                "The M-Pesa request could not be completed."
            ),
        }

    response_code = str(data.get("ResponseCode", ""))

    if response_code != "0":
        return {
            "simulated": False,
            "status": "failed",
            "checkout_request_id": data.get("CheckoutRequestID"),
            "merchant_request_id": data.get("MerchantRequestID"),
            "result_code": response_code or None,
            "result_description": data.get(
                "ResponseDescription",
                "M-Pesa rejected the payment request.",
            ),
        }

    return {
        "simulated": False,
        "status": "processing",
        "checkout_request_id": data.get("CheckoutRequestID"),
        "merchant_request_id": data.get("MerchantRequestID"),
        "result_code": response_code,
        "result_description": data.get(
            "ResponseDescription",
            "STK Push sent. Awaiting payment confirmation.",
        ),
    }
