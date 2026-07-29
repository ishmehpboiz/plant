from pydantic import BaseModel


class PlantCreate(BaseModel):
    name: str
    photo_base64: str
    location_lat: float
    location_lng: float


class PlantOut(BaseModel):
    id: int
    name: str
    species: str
    kc: float
    wilting_point: float
    field_capacity: float
    current_moisture: float

    model_config = {"from_attributes": True}


class PlantListItem(PlantOut):
    needs_watering: bool
