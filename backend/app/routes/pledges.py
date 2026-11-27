from decimal import Decimal

from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.opportunity import Opportunity
from app.models.pledge import Pledge
from app.schemas.pledge_schema import (
    PledgeCreateSchema,
    PledgeSchema,
)
from app.services import audit_service
from app.services.notification_service import notify
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.reference_ids import make_reference
from app.utils.validators import parse_body


bp = Blueprint(
    "pledges",
    __name__,
    url_prefix="/api/pledges",
)


def _get_own_pledge(pledge_id, donor_id):
    """Find a pledge belonging to the authenticated donor."""

    pledge = db.session.scalar(
        select(Pledge).where(
            Pledge.id == pledge_id,
            Pledge.donor_id == donor_id,
        )
    )

    if pledge is None:
        raise ApiError(
            404,
            "not_found",
            "Pledge not found",
        )

    return pledge


def _get_pledge_quantity(pledge):
    """Return the physical quantity of an in-kind pledge."""

    if pledge.pledge_type == "in_kind":
        return Decimal(str(pledge.quantity or 0))

    return Decimal("0")


def _has_other_active_pledges(opportunity_id, excluded_pledge_id):
    """Check whether an opportunity has other active pledges."""

    active_pledge = db.session.scalar(
        select(Pledge.id)
        .where(
            Pledge.opportunity_id == opportunity_id,
            Pledge.id != excluded_pledge_id,
            Pledge.status.in_(
                ("pending", "confirmed", "fulfilled")
            ),
        )
        .limit(1)
    )

    return active_pledge is not None


@bp.post("")
@role_required("donor")
def create_pledge():
    """Create a financial or in-kind pledge."""

    donor = get_current_user()
    data = parse_body(PledgeCreateSchema())

    opportunity = db.session.get(
        Opportunity,
        data["opportunity_id"],
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
            "This opportunity is not accepting pledges",
        )

    pledge_type = data["pledge_type"]

    if pledge_type == "in_kind":
        if not data.get("quantity"):
            raise ApiError(
                400,
                "invalid_pledge",
                "An in-kind pledge must include a quantity",
            )

        amount = Decimal("0")
        quantity = data["quantity"]

    elif pledge_type == "financial":
        if not data.get("amount"):
            raise ApiError(
                400,
                "invalid_pledge",
                "A financial pledge must include an amount",
            )

        amount = Decimal(str(data["amount"]))
        quantity = None

    else:
        raise ApiError(
            400,
            "invalid_pledge",
            "Unsupported pledge type",
        )

    pledge = Pledge(
        donor_id=donor.id,
        opportunity_id=opportunity.id,
        pledge_type=pledge_type,
        quantity=quantity,
        amount=amount,
        description=data.get("description"),
        payment_method=data.get("payment_method"),
        status="pending",
    )

    db.session.add(pledge)
    db.session.flush()

    pledge.reference = make_reference(
        "PLG",
        pledge.id,
    )

    # Only in-kind pledges increase resource quantities.
    opportunity.pledged_qty = (
        Decimal(str(opportunity.pledged_qty or 0))
        + _get_pledge_quantity(pledge)
    )

    if opportunity.stage == "Published":
        opportunity.stage = "Pledged"

    audit_service.log_event(
        "pledge",
        "Donor pledge created",
        f"{pledge.reference} for {opportunity.title}",
        actor=donor,
        entity_type="pledge",
        entity_id=pledge.id,
        commit=False,
    )

    notify(
        donor.id,
        "Pledge recorded",
        f"Your pledge for {opportunity.title} has been recorded.",
        kind="pledge",
        commit=False,
    )

    db.session.commit()

    return jsonify({
        "pledge": PledgeSchema().dump(pledge)
    }), 201


@bp.get("/mine")
@role_required("donor")
def my_pledges():
    """List pledges belonging to the authenticated donor."""

    donor = get_current_user()

    stmt = (
        select(Pledge)
        .where(Pledge.donor_id == donor.id)
        .order_by(Pledge.created_at.desc())
    )

    return jsonify(
        paginate(stmt, PledgeSchema())
    )


@bp.get("/<int:pledge_id>")
@role_required("donor")
def get_pledge(pledge_id):
    """Retrieve one pledge belonging to the authenticated donor."""

    donor = get_current_user()
    pledge = _get_own_pledge(
        pledge_id,
        donor.id,
    )

    return jsonify({
        "pledge": PledgeSchema().dump(pledge)
    })


@bp.patch("/<int:pledge_id>/cancel")
@role_required("donor")
def cancel_pledge(pledge_id):
    """Cancel a pending pledge belonging to the donor."""

    donor = get_current_user()
    pledge = _get_own_pledge(
        pledge_id,
        donor.id,
    )

    if pledge.status != "pending":
        raise ApiError(
            409,
            "pledge_not_cancellable",
            "Only pending pledges can be cancelled",
        )

    opportunity = pledge.opportunity

    current_quantity = Decimal(
        str(opportunity.pledged_qty or 0)
    )

    pledge_quantity = _get_pledge_quantity(pledge)

    # Reverse only the physical quantity originally pledged.
    opportunity.pledged_qty = max(
        Decimal("0"),
        current_quantity - pledge_quantity,
    )

    pledge.status = "cancelled"

    # Do not revert the opportunity while other active
    # financial or in-kind pledges still exist.
    has_active_pledges = _has_other_active_pledges(
        opportunity.id,
        pledge.id,
    )

    if (
        opportunity.stage == "Pledged"
        and not has_active_pledges
    ):
        opportunity.stage = "Published"

    audit_service.log_event(
        "pledge",
        "Donor pledge cancelled",
        f"{pledge.reference} for {opportunity.title}",
        actor=donor,
        entity_type="pledge",
        entity_id=pledge.id,
        commit=False,
    )

    notify(
        donor.id,
        "Pledge cancelled",
        f"Your pledge for {opportunity.title} has been cancelled.",
        kind="pledge",
        commit=False,
    )

    db.session.commit()

    return jsonify({
        "pledge": PledgeSchema().dump(pledge)
    })