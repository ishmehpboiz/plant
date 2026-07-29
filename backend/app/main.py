from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import Base, engine, get_db

app = FastAPI(title="Smart Plant Watering Simulator API")

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


@app.post("/api/daily-update")
def daily_update(db: Session = Depends(get_db)):
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
