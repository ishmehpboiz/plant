import os

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import Base, engine, get_db

app = FastAPI(title="Smart Plant Watering Simulator API")

# Only needed for local dev, where the frontend (:3000) and backend (:8000)
# are different origins. In production, vercel.json routes both through one
# domain, so the browser sees same-origin requests and this never applies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# v1: create tables on startup instead of a migrations tool.
Base.metadata.create_all(bind=engine)


@app.post("/api/plants", response_model=schemas.PlantOut)
def create_plant(plant_in: schemas.PlantCreate, db: Session = Depends(get_db)):
    return crud.create_plant(db, plant_in)


@app.get("/api/plants", response_model=list[schemas.PlantListItem])
def list_plants(db: Session = Depends(get_db)):
    plants = crud.list_plants(db)
    return [
        schemas.PlantListItem(
            **schemas.PlantOut.model_validate(plant).model_dump(),
            needs_watering=crud.needs_watering(plant),
        )
        for plant in plants
    ]


def _verify_cron_request(authorization: str | None) -> None:
    """Vercel Cron calls with `Authorization: Bearer $CRON_SECRET` when that
    env var is set on the project -- reject anything else so this endpoint
    (which mutates every plant's moisture) isn't publicly triggerable.
    Unenforced when CRON_SECRET isn't set, so local dev needs no setup."""
    secret = os.environ.get("CRON_SECRET")
    if secret and authorization != f"Bearer {secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.api_route("/api/daily-update", methods=["GET", "POST"])
def daily_update(db: Session = Depends(get_db), authorization: str | None = Header(default=None)):
    _verify_cron_request(authorization)
    return crud.run_daily_update(db)


@app.post("/api/plants/{plant_id}/water", response_model=schemas.PlantOut)
def water_plant(plant_id: int, body: schemas.WaterRequest, db: Session = Depends(get_db)):
    plant = crud.get_plant(db, plant_id)
    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return crud.water_plant(db, plant, body.amount_liters)


@app.get("/api/plants/{plant_id}/history", response_model=schemas.PlantHistory)
def get_plant_history(plant_id: int, days: int = 30, db: Session = Depends(get_db)):
    if crud.get_plant(db, plant_id) is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    rows = crud.get_history(db, plant_id, days)
    return schemas.PlantHistory(
        plant_id=plant_id,
        history=[schemas.HistoryPoint.model_validate(row) for row in rows],
    )


@app.get("/api/watering-events", response_model=list[schemas.WateringEventOut])
def list_watering_events(limit: int = 8, db: Session = Depends(get_db)):
    rows = crud.get_recent_watering_events(db, limit)
    return [
        schemas.WateringEventOut(
            plant_id=event.plant_id,
            plant_name=plant_name,
            amount_liters=event.amount_liters,
            watered_at=event.watered_at,
        )
        for event, plant_name in rows
    ]
