from marshmallow import fields, validate

from app.schemas import CamelSchema


APPOINTMENT_STATUSES = (
    "pending",
    "confirmed",
    "cancelled",
    "completed",
)


class AppointmentCreateSchema(CamelSchema):
    centre_id = fields.Integer(
        required=True,
        validate=validate.Range(min=1),
    )

    slot_start = fields.DateTime(
        required=True,
    )


class AppointmentSchema(CamelSchema):
    id = fields.Integer(dump_only=True)

    centre_id = fields.Integer(dump_only=True)

    donor_id = fields.Integer(dump_only=True)

    slot_start = fields.DateTime(dump_only=True)

    status = fields.String(dump_only=True)

    centre_name = fields.Method(
        "get_centre_name",
        dump_only=True,
    )

    county = fields.Method(
        "get_county",
        dump_only=True,
    )

    location = fields.Method(
        "get_location",
        dump_only=True,
    )

    created_at = fields.DateTime(dump_only=True)

    def get_centre_name(self, appointment):
        if appointment.centre is not None:
            return appointment.centre.name

        return ""

    def get_county(self, appointment):
        if appointment.centre is not None:
            return appointment.centre.county

        return ""

    def get_location(self, appointment):
        if appointment.centre is not None:
            return appointment.centre.general_area

        return ""
