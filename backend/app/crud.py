from sqlalchemy.orm import Session

from app import kc_table, models, schemas, species_id


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
        location_lat=plant_in.location_lat,
        location_lng=plant_in.location_lng,
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


def list_plants(db: Session) -> list[models.Plant]:
    return db.query(models.Plant).order_by(models.Plant.id).all()


def needs_watering(plant: models.Plant) -> bool:
    # Placeholder threshold pending step 2's water-balance/threshold logic --
    # a species-specific "needs watering" trigger should sit above the
    # wilting point, not exactly at it.
    return plant.current_moisture <= plant.wilting_point
