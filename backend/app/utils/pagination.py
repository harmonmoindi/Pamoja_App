from flask import request

from app.extensions import db


def paginate(stmt, schema):
    """Paginates a SQLAlchemy select() and returns the agreed list format:

        { "items": [...], "page": 1, "perPage": 20, "total": 123 }

    The client sends ?page=1&perPage=20.   Usage:
        return jsonify(paginate(select(User).order_by(User.id), UserSchema()))
    """
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("perPage", 20, type=int), 1), 100)
    result = db.paginate(stmt, page=page, per_page=per_page, error_out=False)
    return {
        "items": schema.dump(result.items, many=True),
        "page": page,
        "perPage": per_page,
        "total": result.total,
    }