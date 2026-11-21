from marshmallow import EXCLUDE, Schema


def to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class CamelSchema(Schema):
    """Base class for every schema.

    You write fields in snake_case (submitted_on) and the API uses camelCase (submittedOn),
    matching the TypeScript types in the front-end. Unknown keys sent by a client are ignored.
    """

    class Meta:
        unknown = EXCLUDE

    def on_bind_field(self, field_name, field_obj):
        field_obj.data_key = to_camel(field_obj.data_key or field_name)