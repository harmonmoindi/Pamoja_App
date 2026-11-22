import pytest
from marshmallow import ValidationError
from app.schemas.assessment_schema import AssessmentCreateSchema
from app.schemas.delivery_schema import DeliveryCreateSchema, DeliveryUpdateSchema

def test_valid_assessment():
    data = AssessmentCreateSchema().load({
        "outcome": "approved",
        "priority": "high",
        "notes": "Beneficiary request verified"
    })
    assert data["outcome"] == "approved"
    assert data["priority"] == "high"

def test_assessment_requires_outcome():
    with pytest.raises(ValidationError):
        AssessmentCreateSchema().load({"priority": "high"})

def test_assessment_rejects_blank_priority():
    with pytest.raises(ValidationError):
        AssessmentCreateSchema().load({
            "outcome": "approved",
            "priority": " "
        })

def test_valid_delivery():
    data = DeliveryCreateSchema().load({
        "requestId": 12,
        "pledgeId": 5
    })
    assert data["request_id"] == 12
    assert data["pledge_id"] == 5

def test_delivery_requires_request():
    with pytest.raises(ValidationError):
        DeliveryCreateSchema().load({"pledgeId": 5})

def test_delivery_rejects_invalid_request_id():
    with pytest.raises(ValidationError):
        DeliveryCreateSchema().load({"requestId": -1})

def test_valid_delivery_update():
    data = DeliveryUpdateSchema().load({"status": "in_transit"})
    assert data["status"] == "in_transit"

def test_delivery_update_requires_status():
    with pytest.raises(ValidationError):
        DeliveryUpdateSchema().load({})