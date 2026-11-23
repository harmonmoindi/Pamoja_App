import pytest
from app.errors import ApiError
from app.routes.deliveries import validate_transition

@pytest.mark.parametrize("current,new", [
    ("pending", "assigned"),
    ("assigned", "in_transit"),
    ("assigned", "failed"),
    ("in_transit", "delivered"),
    ("in_transit", "failed")
])
def test_valid_delivery_transition(current, new):
    assert validate_transition(current, new) is True

@pytest.mark.parametrize("current,new", [
    ("pending", "delivered"),
    ("pending", "failed"),
    ("assigned", "delivered"),
    ("delivered", "pending"),
    ("delivered", "assigned"),
    ("failed", "in_transit"),
    ("failed", "delivered")
])
def test_invalid_delivery_transition(current, new):
    with pytest.raises(ApiError) as error:
        validate_transition(current, new)

    assert error.value.status == 409

def test_unknown_delivery_status():
    with pytest.raises(ApiError):
        validate_transition("pending", "unknown")