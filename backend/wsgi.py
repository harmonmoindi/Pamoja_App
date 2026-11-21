from app import create_app

# Entry point for production servers (for example: gunicorn wsgi:app).
app = create_app()
