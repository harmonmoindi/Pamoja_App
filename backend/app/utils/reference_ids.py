def make_reference(kind: str, pk: int) -> str:
    """Human-readable ID built from the database id.   make_reference("REQ", 42) -> "PAM-REQ-1042"

    kind is a short code: REQ (request), DEL (delivery), PLG (pledge), DON (donation).
    """
    return f"PAM-{kind}-{1000 + pk}"
