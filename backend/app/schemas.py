from datetime import date

from pydantic import BaseModel


class PlantCreate(BaseModel):
    name: str
    photo_base64: str
    location_lat: float
    location_lng: float


class WaterRequest(BaseModel):
    amount_liters: float | None = None


class HistoryPoint(BaseModel):
    date: date
    moisture: float
    et0: float
    rainfall: float
    irrigated: bool

    model_config = {"from_attributes": True}


class PlantHistory(BaseModel):
    plant_id: int
    history: list[HistoryPoint]


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
