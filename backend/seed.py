"""Fills the database with demo data.  Run:  python seed.py

Every file in app/seeds named seed_<number>_<name>.py is run in alphabetical order
and must define a run() function. Each owner keeps their own file:

    seed_01_core.py      Harmon: users and agencies
    seed_20_donor.py     Donor dev
    seed_30_beneficiary.py   Beneficiary dev
    seed_40_agency.py    Agency dev
    seed_90_admin.py     Harmon: audit log

Seed functions must be safe to run twice (check before inserting).
"""
import importlib
import pkgutil

from app import create_app, seeds
from app.extensions import db


def main():
    flask_app = create_app()
    with flask_app.app_context():
        modules = sorted(pkgutil.iter_modules(seeds.__path__), key=lambda m: m.name)
        for info in modules:
            if not info.name.startswith("seed_"):
                continue
            module = importlib.import_module(f"app.seeds.{info.name}")
            if hasattr(module, "run"):
                print(f"Seeding {info.name} ...")
                module.run()
                db.session.commit()
    print("Done.")


if __name__ == "__main__":
    main()
