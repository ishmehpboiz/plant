from fastapi import Depends, FastAPI
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
