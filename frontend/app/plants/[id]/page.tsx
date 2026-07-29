"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getPlant, getPlantHistory } from "@/lib/api";
import { MoistureChart } from "@/components/MoistureChart";
import { MoistureIndicator } from "@/components/MoistureIndicator";
import { WaterButton } from "@/components/WaterButton";
import type { Plant, PlantHistory, PlantListItem } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function PlantDetailPage({ params }: PageProps) {
  const { id: idParam } = use(params);
  const id = Number(idParam);

  const [plant, setPlant] = useState<PlantListItem | null>(null);
  const [history, setHistory] = useState<PlantHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [p, h] = await Promise.all([getPlant(id), getPlantHistory(id, 30)]);
    if (!p) {
      setError("Plant not found");
      return;
    }
    setPlant(p);
    setHistory(h);
  }, [id]);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Invalid plant id");
      return;
    }
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id, load]);

  function onWatered(updated: Plant) {
    setPlant((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      const threshold =
        next.wilting_point + (next.field_capacity - next.wilting_point) * 0.25;
      next.needs_watering = next.current_moisture <= threshold;
      return next;
    });
    getPlantHistory(id, 30).then(setHistory).catch(() => {});
  }

  if (error) {
    return (
      <main>
        <Link href="/" className="back-link">
          ← All plants
        </Link>
        <p className="error-state">{error}</p>
      </main>
    );
  }

  if (!plant || !history) {
    return (
      <main>
        <p className="loading">Loading plant…</p>
      </main>
    );
  }

  return (
    <main>
      <Link href="/" className="back-link">
        ← All plants
      </Link>

      <div className="dashboard">
        <aside className="dash-aside">
          <div className="dash-meta">
            <h1>{plant.name}</h1>
            <p className="species">{plant.species}</p>
          </div>

          <MoistureIndicator
            moisture={plant.current_moisture}
            wiltingPoint={plant.wilting_point}
            fieldCapacity={plant.field_capacity}
            needsWatering={plant.needs_watering}
          />

          <WaterButton plantId={plant.id} onWatered={onWatered} />

          <div className="stats">
            <div className="stat">
              <span>Kc</span>
              <strong>{plant.kc.toFixed(2)}</strong>
            </div>
            <div className="stat">
              <span>Wilt</span>
              <strong>{Math.round(plant.wilting_point * 100)}%</strong>
            </div>
            <div className="stat">
              <span>Field</span>
              <strong>{Math.round(plant.field_capacity * 100)}%</strong>
            </div>
          </div>
        </aside>

        <MoistureChart history={history.history} />
      </div>
    </main>
  );
}
