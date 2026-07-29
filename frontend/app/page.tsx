"use client";

import { useCallback, useEffect, useState } from "react";
import { getPlants } from "@/lib/api";
import { GardenExperience } from "@/components/garden/GardenExperience";
import type { PlantListItem } from "@/lib/types";

export default function HomePage() {
  const [plants, setPlants] = useState<PlantListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getPlants()
      .then(setPlants)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <p className="error-state">{error}</p>;
  }

  if (!plants) {
    return <p className="loading loading--garden">Loading garden…</p>;
  }

  return <GardenExperience plants={plants} onPlantsChange={load} />;
}
