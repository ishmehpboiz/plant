"use client";

import { WaterButton } from "@/components/WaterButton";
import type { Plant, PlantListItem } from "@/lib/types";

type Props = {
  plants: PlantListItem[];
  onWatered: (plant: Plant) => void;
};

export function ActionsSummary({ plants, onWatered }: Props) {
  const thirsty = plants.filter((p) => p.needs_watering);
  if (thirsty.length === 0) return null;

  return (
    <div className="actions-summary">
      <p className="actions-summary__heading">Needs water today</p>
      <ul>
        {thirsty.map((plant) => (
          <li key={plant.id} className="actions-summary__row">
            <span className="actions-summary__name">{plant.name}</span>
            <span className="actions-summary__pct">
              {Math.round(plant.current_moisture * 100)}%
            </span>
            <WaterButton plantId={plant.id} onWatered={onWatered} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}
