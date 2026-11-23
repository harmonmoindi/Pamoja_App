from app.extensions import db
from app.models.mixins import TimestampMixin


class InventoryItem(TimestampMixin, db.Model):
    """Stock held by an agency for matching against assistance requests."""

    __tablename__ = "inventory_items"

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(30), unique=True, index=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    county = db.Column(db.String(80), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    unit = db.Column(db.String(40), nullable=False, default="units")
    minimum = db.Column(db.Integer, nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<InventoryItem {self.reference} - {self.name}>"
