import pytest

from app.services.matching_service import (
    suggest_matches,
    validate_allocation
)


def test_matching_resources():
    need = {
        "category": "Food Supplies",
        "county": "Nairobi",
        "required": 20,
        "allocated": 5,
        "unit": "packages"
    }

    resources = [
        {
            "id": 1,
            "category": "Food Supplies",
            "county": "Kiambu",
            "available": 20,
            "unit": "packages"
        },
        {
            "id": 2,
            "category": "Food Supplies",
            "county": "Nairobi",
            "available": 12,
            "unit": "packages"
        }
    ]

    matches = suggest_matches(need, resources)

    assert len(matches) == 2
    assert matches[0]["resourceId"] == 2
    assert matches[0]["sameCounty"] is True
    assert matches[0]["suggestedQuantity"] == 12


def test_matching_rejects_wrong_category():
    need = {
        "category": "Food Supplies",
        "county": "Nairobi",
        "required": 10,
        "allocated": 0,
        "unit": "packages"
    }

    resources = [{
        "id": 1,
        "category": "Clothing",
        "county": "Nairobi",
        "available": 10,
        "unit": "packages"
    }]

    assert suggest_matches(need, resources) == []


def test_matching_rejects_unavailable_resources():
    need = {
        "category": "Food Supplies",
        "county": "Nairobi",
        "required": 10,
        "allocated": 0,
        "unit": "packages"
    }

    resources = [{
        "id": 1,
        "category": "Food Supplies",
        "county": "Nairobi",
        "available": 0,
        "unit": "packages"
    }]

    assert suggest_matches(need, resources) == []


def test_matching_completed_request():
    need = {
        "category": "Food Supplies",
        "county": "Nairobi",
        "required": 10,
        "allocated": 10,
        "unit": "packages"
    }

    assert suggest_matches(need, []) == []


def test_valid_allocation():
    need = {
        "category": "Food Supplies",
        "required": 10,
        "allocated": 0,
        "unit": "packages"
    }

    resource = {
        "category": "Food Supplies",
        "available": 15,
        "unit": "packages"
    }

    assert validate_allocation(need, resource, 5) is True


def test_allocation_rejects_insufficient_stock():
    need = {
        "category": "Food Supplies",
        "required": 20,
        "allocated": 0,
        "unit": "packages"
    }

    resource = {
        "category": "Food Supplies",
        "available": 5,
        "unit": "packages"
    }

    with pytest.raises(ValueError, match="Insufficient resources"):
        validate_allocation(need, resource, 10)