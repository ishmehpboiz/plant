"use client";

import { useEffect, useState } from "react";
import { KANYAKUMARI } from "@/lib/mocks";

type DayForecast = {
  date: string;
  et0: number;
  rainfall: number;
  tempMax: number;
};

/**
 * Real client-side call to Open-Meteo's forecast API (no key needed, and it
 * allows cross-origin browser requests) -- not mocked, since this is a
 * genuinely free/unlimited public API and the data is directly relevant to
 * "will I need to water soon."
 */
async function fetchOutlook(): Promise<DayForecast[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(KANYAKUMARI.lat));
  url.searchParams.set("longitude", String(KANYAKUMARI.lng));
  url.searchParams.set("daily", "et0_fao_evapotranspiration,precipitation_sum,temperature_2m_max");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "5");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();
  const { time, et0_fao_evapotranspiration, precipitation_sum, temperature_2m_max } = json.daily;

  return time.map((date: string, i: number) => ({
    date,
    et0: et0_fao_evapotranspiration[i],
    rainfall: precipitation_sum[i],
    tempMax: temperature_2m_max[i],
  }));
}

function dayLabel(iso: string, i: number): string {
  if (i === 0) return "Today";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short" });
}

export function WeatherOutlook() {
  const [days, setDays] = useState<DayForecast[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchOutlook().then(setDays).catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  return (
    <div className="insight-card">
      <p className="insight-card__heading">Weather outlook · Kanyakumari</p>
      {!days && <p className="insight-card__empty">Loading forecast…</p>}
      {days && (
        <div className="weather-outlook">
          {days.map((d, i) => (
            <div className="weather-outlook__day" key={d.date}>
              <span className="weather-outlook__label">{dayLabel(d.date, i)}</span>
              <span className="weather-outlook__temp">{Math.round(d.tempMax)}°</span>
              <span className="weather-outlook__stat">Loss {d.et0.toFixed(1)}mm</span>
              <span className="weather-outlook__stat">
                {d.rainfall > 0 ? `Rain ${d.rainfall.toFixed(1)}mm` : "No rain"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
