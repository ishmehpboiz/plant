"use client";

import { useEffect, useState } from "react";
import { getAllHistories, getPlantHistory } from "@/lib/api";
import { MoistureChart } from "@/components/MoistureChart";
import { MoistureIndicator } from "@/components/MoistureIndicator";
import { WaterButton } from "@/components/WaterButton";
import { AddPlantForm } from "@/components/AddPlantForm";
import { GardenMap2D } from "./GardenMap2D";
import { PlantRail } from "./PlantRail";
import { ActionsSummary } from "./ActionsSummary";
import { GardenHealthGauge } from "./GardenHealthGauge";
import { TrendStrip } from "./TrendStrip";
import { WateringLog } from "./WateringLog";
import { WeatherOutlook } from "./WeatherOutlook";
import type { Plant, PlantHistory, PlantListItem } from "@/lib/types";

type Props = {
  plants: PlantListItem[];
  onPlantsChange: () => void;
};

export function GardenExperience({ plants, onPlantsChange }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [history, setHistory] = useState<PlantHistory | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [plantState, setPlantState] = useState<PlantListItem[]>(plants);
  const [allHistories, setAllHistories] = useState<Record<number, PlantHistory>>({});
  const [insightsVersion, setInsightsVersion] = useState(0);

  useEffect(() => {
    setPlantState(plants);
  }, [plants]);

  useEffect(() => {
    getAllHistories(30).then(setAllHistories).catch(() => setAllHistories({}));
  }, [insightsVersion, plants]);

  const selected = plantState.find((p) => p.id === selectedId) ?? null;
  const needsWaterCount = plantState.filter((p) => p.needs_watering).length;

  const trends: Record<number, "up" | "down" | "flat"> = {};
  for (const plant of plantState) {
    const hist = allHistories[plant.id]?.history ?? [];
    if (hist.length < 2) continue;
    const delta = hist[hist.length - 1].moisture - hist[hist.length - 2].moisture;
    trends[plant.id] = Math.abs(delta) < 0.005 ? "flat" : delta > 0 ? "up" : "down";
  }

  useEffect(() => {
    if (!selectedId) {
      setHistory(null);
      return;
    }
    getPlantHistory(selectedId, 30).then(setHistory).catch(() => setHistory(null));
  }, [selectedId]);

  function onWatered(updated: Plant) {
    setPlantState((prev) =>
      prev.map((p) => {
        if (p.id !== updated.id) return p;
        const next = { ...p, ...updated };
        const threshold =
          next.wilting_point + (next.field_capacity - next.wilting_point) * 0.25;
        next.needs_watering = next.current_moisture <= threshold;
        return next;
      }),
    );
    onPlantsChange();
    if (selectedId) getPlantHistory(selectedId, 30).then(setHistory).catch(() => {});
    setInsightsVersion((v) => v + 1);
  }

  return (
    <div className="garden-page">
      <header className="garden-page__header">
        <div className="garden-page__title-row">
          <GardenHealthGauge plants={plantState} />
          <div>
            <p className="garden-overlay__label">Kanyakumari Garden</p>
            <h1 className="garden-overlay__title">
              {needsWaterCount} of {plantState.length} plants{" "}
              <em>need water</em> today
            </h1>
          </div>
        </div>
        <div className="garden-overlay__actions">
          <div className="weather-chip weather-chip--overlay">
            <span>Water loss <b>6.14mm</b></span>
            <span>Rain <b>3.0mm</b></span>
            <span>6:00 AM</span>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setShowAdd(true);
              setSelectedId(null);
            }}
          >
            Add plant
          </button>
        </div>
      </header>

      <p className="garden-hint">Tap a plant on the map to inspect moisture</p>

      <ActionsSummary plants={plantState} onWatered={onWatered} />

      <div className="garden-page__layout">
        <PlantRail
          plants={plantState}
          selectedId={selectedId}
          trends={trends}
          onSelectPlant={(id) => {
            setSelectedId(id);
            setShowAdd(false);
          }}
        />

        <div className="garden-page__body">
        <GardenMap2D
          plants={plantState}
          selectedId={selectedId}
          onSelectPlant={(id) => {
            setSelectedId(id);
            setShowAdd(false);
          }}
        />

        {selected && !showAdd && (
          <aside className="garden-panel garden-panel--inline">
            <button
              type="button"
              className="garden-panel__close"
              onClick={() => setSelectedId(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2>{selected.name}</h2>
            <p className="garden-panel__species">{selected.species}</p>
            <span
              className={`status-badge ${selected.needs_watering ? "needs" : "ok"}`}
            >
              <span className="dot" />
              {selected.needs_watering ? "Needs water" : "Healthy"}
            </span>

            <MoistureIndicator
              moisture={selected.current_moisture}
              wiltingPoint={selected.wilting_point}
              fieldCapacity={selected.field_capacity}
              needsWatering={selected.needs_watering}
            />

            <WaterButton plantId={selected.id} onWatered={onWatered} />

            {history && (
              <div className="garden-panel__chart">
                <MoistureChart history={history.history} />
              </div>
            )}
          </aside>
        )}

        {showAdd && (
          <aside className="garden-panel garden-panel--inline garden-panel--wide">
            <button
              type="button"
              className="garden-panel__close"
              onClick={() => setShowAdd(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2>Add a plant</h2>
            <p className="garden-panel__species">
              Photo upload → species ID (mocked). New plant appears on the map.
            </p>
            <AddPlantForm
              onSuccess={(id) => {
                setShowAdd(false);
                onPlantsChange();
                setSelectedId(id);
              }}
            />
          </aside>
        )}
        </div>
      </div>

      <div className="garden-insights">
        <TrendStrip plants={plantState} histories={allHistories} />
        <WateringLog refreshKey={insightsVersion} />
        <WeatherOutlook />
      </div>
    </div>
  );
}
