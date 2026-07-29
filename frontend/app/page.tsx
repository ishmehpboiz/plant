"use client";

import { useEffect, useState } from "react";
import { getPlants, USE_MOCKS } from "@/lib/api";
import { PlantList } from "@/components/PlantList";
import type { PlantListItem } from "@/lib/types";

export default function HomePage() {
  const [plants, setPlants] = useState<PlantListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlants()
      .then(setPlants)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <main>
      <section className="hero-block">
        <h1>Garden plants</h1>
        <p>
          Simulated soil moisture from local ET0, rainfall, and species Kc —
          built for outdoor plantings around Kanyakumari.
        </p>
        {USE_MOCKS && <span className="mock-banner">Mock API · contract shapes</span>}
      </section>

      {error && <p className="error-state">{error}</p>}
      {!plants && !error && <p className="loading">Loading plants…</p>}
      {plants && <PlantList plants={plants} />}
    </main>
  );
}
