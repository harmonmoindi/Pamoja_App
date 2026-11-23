def normalize(value):
    return str(value or "").strip().lower()


def suggest_matches(need, resources):
    remaining = max(
        int(need.get("required", 0)) - int(need.get("allocated", 0)),
        0
    )

    if remaining == 0:
        return []

    matches = []

    for resource in resources:
        available = int(resource.get("available", 0))

        if available <= 0:
            continue

        if normalize(resource.get("category")) != normalize(need.get("category")):
            continue

        if normalize(resource.get("unit")) != normalize(need.get("unit")):
            continue

        same_county = normalize(resource.get("county")) == normalize(need.get("county"))

        matches.append({
            "resourceId": resource["id"],
            "county": resource.get("county"),
            "available": available,
            "suggestedQuantity": min(remaining, available),
            "sameCounty": same_county
        })

    return sorted(
        matches,
        key=lambda item: (
            not item["sameCounty"],
            -item["suggestedQuantity"]
        )
    )


def validate_allocation(need, resource, quantity):
    if type(quantity) is not int or quantity <= 0:
        raise ValueError("Quantity must be a positive integer")

    if normalize(need.get("category")) != normalize(resource.get("category")):
        raise ValueError("Resource category does not match the request")

    if normalize(need.get("unit")) != normalize(resource.get("unit")):
        raise ValueError("Resource unit does not match the request")

    remaining = int(need.get("required", 0)) - int(need.get("allocated", 0))
    available = int(resource.get("available", 0))

    if quantity > remaining:
        raise ValueError("Quantity exceeds the remaining request")

    if quantity > available:
        raise ValueError("Insufficient resources available")

    return True