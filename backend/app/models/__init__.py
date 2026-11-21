"""Imports every model file in this folder automatically.

Nobody needs to edit this file: create app/models/<name>.py and it is picked up,
so migrations and relationships can see it.
"""
import importlib
import pkgutil

for _module in pkgutil.iter_modules(__path__):
    importlib.import_module(f"{__name__}.{_module.name}")