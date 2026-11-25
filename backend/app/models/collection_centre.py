from app.extensions import db
from app.models.mixins import TimestampMixin


class CollectionCentre(TimestampMixin, db.Model):
    __tablename__ = "collection_centres"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(160),
        nullable=False,
    )

    county = db.Column(
        db.String(100),
        nullable=False,
        index=True,
    )

    general_area = db.Column(
        db.String(160),
        nullable=False,
    )

    opening_hours = db.Column(
        db.JSON,
        nullable=False,
        default=dict,
    )

    categories = db.Column(
        db.JSON,
        nullable=False,
        default=list,
    )

    organization_id = db.Column(
        db.Integer,
        db.ForeignKey("organizations.id"),
        nullable=True,
        index=True,
    )

    organization = db.relationship(
        "Organization",
        backref=db.backref("collection_centres", lazy=True),
    )

    appointments = db.relationship(
        "Appointment",
        back_populates="centre",
        lazy=True,
    )

    def __repr__(self):
        return f"<CollectionCentre {self.id}: {self.name}>"
