
from datetime import datetime, timezone

from flask import Blueprint, jsonify
from sqlalchemy import select

from app.errors import ApiError
from app.extensions import db
from app.models.appointment import Appointment
from app.models.collection_centre import CollectionCentre
from app.schemas.appointment_schema import (
    AppointmentCreateSchema,
    AppointmentSchema,
)
from app.services import audit_service
from app.services.notification_service import notify
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.validators import parse_body


bp = Blueprint(
    "appointments",
    __name__,
    url_prefix="/api/appointments",
)


def _get_own_appointment(appointment_id, donor_id):
    """Find an appointment belonging to the logged-in donor."""

    appointment = db.session.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.donor_id == donor_id,
        )
    )

    if appointment is None:
        raise ApiError(
            404,
            "not_found",
            "Appointment not found",
        )

    return appointment


@bp.post("")
@role_required("donor")
def create_appointment():
    """Book an appointment at a collection centre."""

    donor = get_current_user()
    data = parse_body(AppointmentCreateSchema())

    centre = db.session.get(
        CollectionCentre,
        data["centre_id"],
    )

    if centre is None:
        raise ApiError(
            404,
            "not_found",
            "Collection centre not found",
        )

    slot_start = data["slot_start"]

    if slot_start.tzinfo is not None:
        slot_start = slot_start.astimezone(
            timezone.utc
        ).replace(tzinfo=None)

    if slot_start <= datetime.utcnow():
        raise ApiError(
            400,
            "invalid_appointment_time",
            "Appointment time must be in the future",
        )

    existing_appointment = db.session.scalar(
        select(Appointment).where(
            Appointment.centre_id == centre.id,
            Appointment.slot_start == slot_start,
            Appointment.status.in_(("pending", "confirmed")),
        )
    )

    if existing_appointment is not None:
        raise ApiError(
            409,
            "appointment_unavailable",
            "This appointment slot is already booked",
        )

    appointment = Appointment(
        centre_id=centre.id,
        donor_id=donor.id,
        slot_start=slot_start,
        status="pending",
    )

    db.session.add(appointment)
    db.session.flush()

    audit_service.log_event(
        "user",
        "Collection appointment booked",
        f"Appointment at {centre.name}",
        actor=donor,
        entity_type="appointment",
        entity_id=appointment.id,
        commit=False,
    )

    notify(
        donor.id,
        "Appointment booked",
        f"Your appointment at {centre.name} is pending confirmation.",
        kind="appointment",
        commit=False,
    )

    db.session.commit()

    return jsonify({
        "appointment": AppointmentSchema().dump(appointment)
    }), 201


@bp.get("/mine")
@role_required("donor")
def my_appointments():
    """List appointments belonging to the logged-in donor."""

    donor = get_current_user()

    stmt = (
        select(Appointment)
        .where(Appointment.donor_id == donor.id)
        .order_by(Appointment.slot_start.desc())
    )

    return jsonify(
        paginate(stmt, AppointmentSchema())
    )


@bp.get("/<int:appointment_id>")
@role_required("donor")
def get_appointment(appointment_id):
    """Get one appointment belonging to the logged-in donor."""

    donor = get_current_user()

    appointment = _get_own_appointment(
        appointment_id,
        donor.id,
    )

    return jsonify({
        "appointment": AppointmentSchema().dump(appointment)
    })


@bp.patch("/<int:appointment_id>/cancel")
@role_required("donor")
def cancel_appointment(appointment_id):
    """Cancel a pending appointment belonging to the donor."""

    donor = get_current_user()

    appointment = _get_own_appointment(
        appointment_id,
        donor.id,
    )

    if appointment.status != "pending":
        raise ApiError(
            409,
            "appointment_not_cancellable",
            "Only pending appointments can be cancelled",
        )

    appointment.status = "cancelled"

    audit_service.log_event(
        "user",
        "Collection appointment cancelled",
        f"Appointment at {appointment.centre.name}",
        actor=donor,
        entity_type="appointment",
        entity_id=appointment.id,
        commit=False,
    )

    notify(
        donor.id,
        "Appointment cancelled",
        f"Your appointment at {appointment.centre.name} was cancelled.",
        kind="appointment",
        commit=False,
    )

    db.session.commit()

    return jsonify({
        "appointment": AppointmentSchema().dump(appointment)
    })
