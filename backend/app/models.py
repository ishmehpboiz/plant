from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Plant(Base):
    __tablename__ = "plants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    species: Mapped[str] = mapped_column(String, nullable=False)
    kc: Mapped[float] = mapped_column(Float, nullable=False)
    wilting_point: Mapped[float] = mapped_column(Float, nullable=False)
    field_capacity: Mapped[float] = mapped_column(Float, nullable=False)
    current_moisture: Mapped[float] = mapped_column(Float, nullable=False)
    typical_watering_liters: Mapped[float] = mapped_column(Float, nullable=False)
    location_lat: Mapped[float] = mapped_column(Float, nullable=False)
    location_lng: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    watering_events: Mapped[list["WateringEvent"]] = relationship(
        back_populates="plant", cascade="all, delete-orphan"
    )
    moisture_history: Mapped[list["MoistureHistory"]] = relationship(
        back_populates="plant", cascade="all, delete-orphan"
    )


class WateringEvent(Base):
    __tablename__ = "watering_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    amount_liters: Mapped[float] = mapped_column(Float, nullable=False)
    watered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    plant: Mapped["Plant"] = relationship(back_populates="watering_events")


class MoistureHistory(Base):
    __tablename__ = "moisture_history"
    __table_args__ = (UniqueConstraint("plant_id", "date", name="uq_moisture_history_plant_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    moisture: Mapped[float] = mapped_column(Float, nullable=False)
    et0: Mapped[float] = mapped_column(Float, nullable=False)
    rainfall: Mapped[float] = mapped_column(Float, nullable=False)
    irrigated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    plant: Mapped["Plant"] = relationship(back_populates="moisture_history")
