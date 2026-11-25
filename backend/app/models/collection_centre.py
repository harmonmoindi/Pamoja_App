from app.extensions import db
from app.models.mixins import TimestampMixin


class CollectionCentre(TimestampMixin, db.Model):
    """Collection centres managed by humanitarian agencies."""

    __tablename__ = "collection_centres"

    id = db.Column(db.Integer, primary_key=True)

    organization_id = db.Column(
        db.Integer,
        db.ForeignKey("organizations.id"),
        nullable=False,
        index=True
    )

    name = db.Column(db.String(120), nullable=False)
    county = db.Column(db.String(80), nullable=False)
    general_area = db.Column(db.String(160), nullable=False)
    opening_hours = db.Column(db.String(160), nullable=False)
    categories = db.Column(db.JSON, nullable=False, default=list)

    def __repr__(self):
        return f"<CollectionCentre {self.id} - {self.name}>"