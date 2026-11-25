from flask import Blueprint, jsonify
from sqlalchemy import select
from app.errors import ApiError
from app.extensions import db
from app.models.collection_centre import CollectionCentre
from app.models.organization import Organization
from app.schemas.centre_schema import CentreCreateSchema, CentreUpdateSchema, CentreSchema
from app.utils.decorators import get_current_user, role_required
from app.utils.pagination import paginate
from app.utils.validators import parse_body

bp = Blueprint("centres", __name__, url_prefix="/api/centres")


@bp.get("")
def list_centres():
    stmt = select(CollectionCentre).order_by(CollectionCentre.id.desc())
    return jsonify(paginate(stmt, CentreSchema()))

@bp.get("/mine")
@role_required("agency")
def list_my_centres():
    user = get_current_user()

    stmt = (
        select(CollectionCentre)
        .join(Organization, CollectionCentre.organization_id == Organization.id)
        .where(Organization.owner_id == user.id)
        .order_by(CollectionCentre.id.desc())
    )

    return jsonify(paginate(stmt, CentreSchema()))

@bp.post("")
@role_required("agency")
def create_centre():
    user = get_current_user()
    data = parse_body(CentreCreateSchema())

    organization = db.session.scalar(
        select(Organization).where(Organization.owner_id == user.id)
    )

    if organization is None:
        raise ApiError(404, "organization_not_found", "No organization is associated with your account")

    centre = CollectionCentre(
        organization_id=organization.id,
        name=data["name"],
        county=data["county"],
        general_area=data["general_area"],
        opening_hours=data["opening_hours"],
        categories=data["categories"]
    )

    db.session.add(centre)
    db.session.commit()

    return jsonify({"centre": CentreSchema().dump(centre)}), 201

@bp.patch("/<int:centre_id>")
@role_required("agency")
def update_centre(centre_id):
    user = get_current_user()
    data = parse_body(CentreUpdateSchema(partial=True))

    if not data:
        raise ApiError(400, "validation_error", "Provide at least one field to update")

    centre = db.session.scalar(
        select(CollectionCentre)
        .join(Organization, CollectionCentre.organization_id == Organization.id)
        .where(
            CollectionCentre.id == centre_id,
            Organization.owner_id == user.id
        )
        .with_for_update(of=CollectionCentre)
    )

    if centre is None:
        raise ApiError(404, "not_found", "Collection centre not found")

    for field, value in data.items():
        setattr(centre, field, value)

    db.session.commit()

    return jsonify({"centre": CentreSchema().dump(centre)})