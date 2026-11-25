"""County and sub-county helpers.

Labels stay at that level. A street, plot, estate, ward, village, box number,
or coordinate is not a general area and is never returned.
"""
import re

_COUNTY_SUFFIX = re.compile(r"\s+county$", re.IGNORECASE)
_SUB_COUNTY_SUFFIX = re.compile(r"\s+sub[-\s]?county$", re.IGNORECASE)
_EXACT_ADDRESS = re.compile(
    r"("
    r"\b(plot|plt|house|hse|apartment|apt|flat|street|road|avenue|ave|lane|"
    r"close|drive|court|building|estate|village|ward|landmark|"
    r"latitude|longitude|gps|coordinates|postal)\b"
    r"|\bp\.?\s*o\.?\s*box\b"
    r"|-?\d{1,3}\.\d{3,}"
    r"|\b\d+[a-zA-Z]?\b"
    r")",
    re.IGNORECASE,
)


def normalize_county(value) -> str:
    """Comparable county name. 'Nairobi County' and 'nairobi' both become 'nairobi'."""
    name = _safe_place(value, kind="county")
    return name.lower() if name else ""


def normalize_sub_county(value) -> str:
    """Comparable sub-county name. A trailing 'sub-county' is ignored."""
    name = _safe_place(value, kind="sub_county")
    return name.lower() if name else ""


def general_area_label(county, sub_county=None, *, share_location=False) -> str:
    """A label safe to show to other people.

    With location sharing off, this is the county only. With it on, a sub-county
    may be added. An exact address is replaced with 'General area'.
    """
    county_name = _safe_place(county, kind="county")
    if not county_name:
        return "General area"
    if not share_location:
        return county_name
    sub_name = _safe_place(sub_county, kind="sub_county")
    if not sub_name or sub_name.lower() == county_name.lower():
        return county_name
    return f"{sub_name}, {county_name}"


def public_area(county, sub_county=None, *, share_location=False) -> dict:
    """County, sub-county, and area label. Address fields are not accepted."""
    county_name = _safe_place(county, kind="county")
    sub_name = _safe_place(sub_county, kind="sub_county") if share_location else None
    return {
        "county": county_name,
        "sub_county": sub_name,
        "area": general_area_label(county, sub_county, share_location=share_location),
    }


def _safe_place(value, *, kind: str) -> str | None:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if not text or len(text) > 80 or _EXACT_ADDRESS.search(text):
        return None
    suffix = _COUNTY_SUFFIX if kind == "county" else _SUB_COUNTY_SUFFIX
    text = suffix.sub("", text).strip()
    if not text or _EXACT_ADDRESS.search(text):
        return None
    return _display_name(text)


def _display_name(value: str) -> str:
    parts = re.split(r"(\s+|-)", value)
    return "".join(part.capitalize() if part.isalpha() else part for part in parts)
