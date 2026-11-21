from app.extensions import db
from app.models.audit_log import AuditLog


def log_event(kind, title, description="", actor=None, actor_label=None, entity_type=None, entity_id=None, commit=True):
    """Records a platform action in the audit log.

    kind is one of: request, delivery, pledge, agency, user, safety.
    actor is a User (or None for the system). Call it from your routes whenever something
    important happens, for example after an assessment is approved or a delivery confirmed.
    """
    entry = AuditLog(
        kind=kind,
        title=title,
        description=description,
        actor_id=actor.id if actor is not None else None,
        actor_label=None if actor is not None else (actor_label or "System"),
        entity_type=entity_type,
        entity_id=entity_id,
    )
    db.session.add(entry)
    if commit:
        db.session.commit()
    return entry
