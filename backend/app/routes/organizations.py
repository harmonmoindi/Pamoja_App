from flask import Blueprint, jsonify
from sqlalchemy import select

from app.models.organization import Organization
from app.schemas.organization_schema import VerifiedOrganizationSchema
from app.utils.decorators import role_required
from app.utils.pagination import paginate

bp = Blueprint("organizations", __name__, url_prefix="/api/organizations")


@bp.get("/verified")
@role_required("beneficiary")
def list_verified_organizations():
    """Agencies a beneficiary may assign when submitting an assistance request."""
    stmt = (
        select(Organization)
        .where(Organization.verification_status == "verified")
        .order_by(Organization.name.asc())
    )
    return jsonify(paginate(stmt, VerifiedOrganizationSchema()))
