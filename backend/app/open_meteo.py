"""Open-Meteo weather client -- no API key needed.

Confirmed live against the real API (not from memory):
  GET https://api.open-meteo.com/v1/forecast
    ?latitude=..&longitude=..
    &daily=et0_fao_evapotranspiration,precipitation_sum
    &timezone=auto&forecast_days=1
returns `daily.et0_fao_evapotranspiration` (mm) and `daily.precipitation_sum`
(mm) for today -- both already computed by Open-Meteo itself (FAO
Penman-Monteith ET0), so no reference-ET0 math needed on our end.
"""

from dataclasses import dataclass

import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


@dataclass(frozen=True)
class DailyWeather:
    et0_mm: float
    rainfall_mm: float


def get_today_weather(lat: float, lng: float) -> DailyWeather:
    response = requests.get(
        FORECAST_URL,
        params={
            "latitude": lat,
            "longitude": lng,
            "daily": "et0_fao_evapotranspiration,precipitation_sum",
            "timezone": "auto",
            "forecast_days": 1,
        },
        timeout=10,
    )
    response.raise_for_status()
    daily = response.json()["daily"]
    return DailyWeather(
        et0_mm=daily["et0_fao_evapotranspiration"][0],
        rainfall_mm=daily["precipitation_sum"][0],
    )
