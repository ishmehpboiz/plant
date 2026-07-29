from datetime import date

from sqlalchemy.orm import Session

from app import kc_table, models, open_meteo, schemas, species_id, water_balance


def create_plant(db: Session, plant_in: schemas.PlantCreate) -> models.Plant:
    species_name = species_id.identify_species(plant_in.photo_base64)
    profile = kc_table.lookup(species_name)

    plant = models.Plant(
        name=plant_in.name,
        species=profile.species,
        kc=profile.kc,
        wilting_point=profile.wilting_point,
        field_capacity=profile.field_capacity,
        current_moisture=profile.field_capacity,  # starts fully watered
        typical_watering_liters=profile.typical_watering_liters,
        location_lat=plant_in.location_lat,
        location_lng=plant_in.location_lng,
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


def list_plants(db: Session) -> list[models.Plant]:
    return db.query(models.Plant).order_by(models.Plant.id).all()


def get_plant(db: Session, plant_id: int) -> models.Plant | None:
    return db.get(models.Plant, plant_id)


def needs_watering(plant: models.Plant) -> bool:
    return water_balance.needs_watering(plant.current_moisture, plant.wilting_point, plant.field_capacity)


def _get_or_create_today_history_row(db: Session, plant: models.Plant) -> models.MoistureHistory:
    today = date.today()
    row = (
        db.query(models.MoistureHistory)
        .filter(models.MoistureHistory.plant_id == plant.id, models.MoistureHistory.date == today)
        .one_or_none()
    )
    if row is None:
        weather = open_meteo.get_today_weather(plant.location_lat, plant.location_lng)
        row = models.MoistureHistory(
            plant_id=plant.id, date=today, et0=weather.et0_mm, rainfall=weather.rainfall_mm, irrigated=False
        )
        db.add(row)
    return row


def run_daily_update(db: Session) -> dict:
    flagged: list[int] = []
    plants = list_plants(db)

    for plant in plants:
        weather = open_meteo.get_today_weather(plant.location_lat, plant.location_lng)

        new_moisture = water_balance.update_moisture(
            current_moisture=plant.current_moisture,
            et0_mm=weather.et0_mm,
            kc=plant.kc,
            rainfall_mm=weather.rainfall_mm,
            wilting_point=plant.wilting_point,
            field_capacity=plant.field_capacity,
        )
        plant.current_moisture = new_moisture

        history_row = _get_or_create_today_history_row(db, plant)
        history_row.moisture = new_moisture
        history_row.et0 = weather.et0_mm
        history_row.rainfall = weather.rainfall_mm

        if needs_watering(plant):
            flagged.append(plant.id)

    db.commit()
    return {"updated": len(plants), "flagged_for_watering": flagged}


def water_plant(db: Session, plant: models.Plant, amount_liters: float | None) -> models.Plant:
    amount = amount_liters if amount_liters is not None else plant.typical_watering_liters

    new_moisture = water_balance.apply_irrigation(
        current_moisture=plant.current_moisture,
        wilting_point=plant.wilting_point,
        field_capacity=plant.field_capacity,
        typical_watering_liters=plant.typical_watering_liters,
        amount_liters=amount,
    )
    plant.current_moisture = new_moisture

    db.add(models.WateringEvent(plant_id=plant.id, amount_liters=amount))

    history_row = _get_or_create_today_history_row(db, plant)
    history_row.moisture = new_moisture
    history_row.irrigated = True

    db.commit()
    db.refresh(plant)
    return plant


def get_history(db: Session, plant_id: int, days: int) -> list[models.MoistureHistory]:
    return (
        db.query(models.MoistureHistory)
        .filter(models.MoistureHistory.plant_id == plant_id)
        .order_by(models.MoistureHistory.date.desc())
        .limit(days)
        .all()[::-1]
    )


def get_recent_watering_events(db: Session, limit: int) -> list[tuple[models.WateringEvent, str]]:
    rows = (
        db.query(models.WateringEvent, models.Plant.name)
        .join(models.Plant, models.WateringEvent.plant_id == models.Plant.id)
        .order_by(models.WateringEvent.watered_at.desc())
        .limit(limit)
        .all()
    )
    return rows
