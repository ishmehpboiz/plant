"""Vercel Python entrypoint. Vercel's Python runtime auto-detects a
module-level `app` as the ASGI/WSGI application to serve -- this just
re-exports our real FastAPI app so `backend/` (containing this file,
`app/`, and `requirements.txt`) can be pointed at directly from vercel.json.

Vercel's runtime executes this file with the Lambda root (/var/task) on
sys.path, not this file's own directory -- so `from app.main import app`
can't find the sibling app/ package by default. Explicitly adding this
file's directory to sys.path fixes that (confirmed against the actual
Vercel traceback: "ModuleNotFoundError: No module named 'app'").
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app  # noqa: E402
