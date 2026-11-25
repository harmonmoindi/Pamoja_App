from app.services.geo_service import general_area_label, normalize_county, normalize_sub_county, public_area


def test_county_names_match_with_or_without_the_suffix():
    assert normalize_county("Nairobi County") == "nairobi"
    assert normalize_county("  nairobi ") == "nairobi"
    assert normalize_county("Nairobi County") == normalize_county("nairobi")


def test_sub_county_names_ignore_the_suffix():
    assert normalize_sub_county("Kasarani Sub-County") == "kasarani"
    assert normalize_sub_county("kasarani sub county") == "kasarani"
    assert normalize_sub_county("Starehe") == "starehe"


def test_general_area_hides_sub_county_unless_location_is_shared():
    assert general_area_label("Turkana", "Turkana North") == "Turkana"
    assert general_area_label("nairobi county", "kasarani", share_location=True) == "Kasarani, Nairobi"


def test_exact_addresses_are_never_returned():
    assert general_area_label("Plot 12, Ngong Road, Nairobi") == "General area"
    assert general_area_label("Nairobi", "12 Moi Avenue", share_location=True) == "Nairobi"
    assert normalize_county("-1.2921, 36.8219") == ""
    assert normalize_sub_county("P.O. Box 40100") == ""

    area = public_area("Nairobi County", "House 4, Kasarani", share_location=True)
    assert area == {"county": "Nairobi", "sub_county": None, "area": "Nairobi"}
    assert "address" not in area
    assert "Ngong" not in str(area)
    assert "House" not in str(area)


def test_missing_county_is_a_general_area():
    assert general_area_label(None) == "General area"
    assert general_area_label("   ") == "General area"
    assert public_area(None, "Kasarani")["sub_county"] is None
