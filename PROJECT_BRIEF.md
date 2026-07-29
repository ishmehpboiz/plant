# Project Brief: Smart Plant Watering Simulator

## What this is
A simulated smart-irrigation system. No hardware — soil moisture is modeled with a water-balance equation driven by real weather data (Open-Meteo), personalized per plant using species data (Plant.id). A daily cron job updates the simulation and decides whether each plant needs watering. Deployed on Vercel (Next.js frontend + FastAPI backend + Vercel Cron), with Postgres (Neon or Supabase) for storage.

## Core logic (both tools need to know this, don't let either reinvent it)
```
moisture(t+1) = moisture(t) + rainfall(t) + irrigation(t) - ETc(t)
ETc(t) = ET0(t) * Kc(species)
```
- `ET0` = reference evapotranspiration, pulled from Open-Meteo (real-time + historical, no API key needed) — this is what makes the model climate-agnostic; it uses actual local weather rather than a region-locked coefficient
- `Kc` = crop coefficient, a species-specific water-need multiplier (looked up from a table keyed by species name, which comes from Plant.id's species ID)
- `moisture` is clipped between a wilting point (too dry) and field capacity (saturated), both also species-dependent
- When `moisture` drops below a species-specific threshold → flag "needs watering"

This is a real, established method (the FAO's standard irrigation-scheduling approach), well-suited to potted/bounded-soil plants specifically. Known limitation to document, not hide: Kc values are an approximation for houseplants/landscape species (see dataset section below), not lab-measured for every exact species.

Stretch (only after the above works): replace the hand-built ET0→moisture step with a small trained regression model (e.g. XGBoost), validated against real historical data from the USDA SCAN network, instead of pure physics equations.

## Kc dataset — where the numbers actually come from
Deployment location: **Kanyakumari, Tamil Nadu** (outdoor/garden plants). This matters because it rules out one common approach:
- **WUCOLS** (California landscape water-use database) is NOT region-appropriate here — its regional multipliers are calibrated for California Mediterranean climates and don't transfer to a tropical coastal climate. Only use WUCOLS for its water-use *category* (low/medium/high) per species as a fallback, never its regional numbers. The reasoning: species water-need category is roughly plant-intrinsic and transfers globally; the region-specific adjustment does not, and real local climate adjustment is already handled by pulling actual Kanyakumari weather from Open-Meteo.
- **Primary source: FAO-56 Kc tables** (Irrigation and Drainage Paper No. 56) — the actual global standard, climate-agnostic by design (pairs with local ET0, exactly this project's structure). Structured data available via the `FAO56` R package (cran.r-project.org/package=FAO56) — export its tables to CSV for use in Python. Full source PDF: fao.org/4/x0490e/x0490e00.htm (cite this in the writeup).
- **Fallback: WUCOLS categories** for ornamental/garden species not covered by FAO-56's crop-focused tables.
- Build the Kc lookup table tagging each entry with its source (FAO-56 vs. WUCOLS-category-estimate) — this transparency is a legitimate engineering point to make in a portfolio writeup, not a weakness to hide.

---

## Split of work

### Claude Code owns: Backend (FastAPI) + Data + Deployment config
- Postgres schema (plants, watering_events, moisture_history — see contract below)
- Endpoints (exact contract below) — CRUD for plants, moisture simulation engine, daily update job, watering log
- Open-Meteo integration (weather + ET0, no API key needed)
- Plant.id integration (species ID from photo upload → species name + Kc lookup)
- Kc / wilting-point / field-capacity lookup table (start with ~10-15 common houseplant species, hardcode as a dict/table — expand later)
- The `/api/daily-update` endpoint that Vercel Cron will call
- `vercel.json` cron config + FastAPI entrypoint setup for Vercel deployment
- Env var handling: `PLANT_ID_API_KEY`, `DATABASE_URL`

### Cursor owns: Frontend (Next.js + Motion Primitives)
- Plant list / add-plant flow (photo upload → calls backend species ID)
- Per-plant dashboard: current simulated moisture level, "needs watering" status, animated moisture-level indicator (Motion Primitives)
- Moisture history chart (recharts) — simulated moisture over time per plant
- Manual "I watered it" button (logs a real watering event, which feeds back into the simulation)
- Builds against the API contract below using mock/dummy JSON responses until the backend is live — don't block frontend work on backend being deployed

---

## Shared API Contract (both tools build against this exactly — do not deviate without updating this doc)

### `POST /api/plants`
Create a plant. Request:
```json
{ "name": "Fiddle Leaf Fig", "photo_base64": "...", "location_lat": 40.7, "location_lng": -74.0 }
```
Response:
```json
{ "id": 1, "name": "Fiddle Leaf Fig", "species": "Ficus lyrata", "kc": 0.7,
  "wilting_point": 0.15, "field_capacity": 0.45, "current_moisture": 0.45 }
```

### `GET /api/plants`
Returns array of plant objects (same shape as above, plus `needs_watering: bool`).

### `GET /api/plants/{id}/history`
Query params: `days` (default 30). Returns:
```json
{ "plant_id": 1, "history": [
  { "date": "2026-07-01", "moisture": 0.42, "et0": 3.1, "rainfall": 0.0, "irrigated": false },
  ...
]}
```

### `POST /api/plants/{id}/water`
Logs a manual watering event, immediately updates `current_moisture` upward. Request: `{ "amount_liters": 0.5 }` (optional, default a species-typical amount). Response: updated plant object.

### `POST /api/daily-update` (called by Vercel Cron, not the frontend directly)
No request body needed. For every plant: fetch today's weather for its lat/lng from Open-Meteo, compute ETc, update `moisture_history` and `current_moisture`, flag `needs_watering` if below threshold. Returns a summary: `{ "updated": 12, "flagged_for_watering": [3, 7] }`.

---

## Build order (follow this, don't build frontend and backend simultaneously blind)
1. **Claude Code**: Postgres schema + `/api/plants` CRUD (no weather/ML yet, just storage) — get this working and deployed to a dev DB first
2. **Claude Code**: Open-Meteo integration + water-balance function as a standalone testable function, then wire into `/api/daily-update`
3. **Claude Code**: Plant.id integration into `POST /api/plants`
4. **Cursor**: Build all frontend screens against the contract above using hardcoded mock JSON matching the exact shapes — don't wait on step 1-3
5. **Integration**: point Cursor's frontend at the real (locally running) backend, fix any contract mismatches
6. **Deploy**: Vercel (Next.js + FastAPI + cron), Neon/Supabase for Postgres, verify cron fires on a production deployment (not preview)

## Environment variables needed
- `PLANT_ID_API_KEY` — from kindwise/Plant.id
- `DATABASE_URL` — from Neon or Supabase
- Open-Meteo needs no key

## Explicitly out of scope for v1
- Real hardware/sensors (structure the code so `current_moisture` could later be overwritten by a real sensor reading instead of the simulation — but don't build that now)
- Auth/multi-user (single-user assumption is fine for v1)
- The ML moisture-predictor upgrade (physics equation is enough for v1; treat as a stretch goal once the core loop works end-to-end)
