"""Vercel Python entrypoint. Vercel's Python runtime auto-detects a
module-level `app` as the ASGI/WSGI application to serve -- this just
re-exports our real FastAPI app so `backend/` (containing this file,
`app/`, and `requirements.txt`) can be pointed at directly from vercel.json.
"""

from app.main import app
