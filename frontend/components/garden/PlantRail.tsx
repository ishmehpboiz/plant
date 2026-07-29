"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PlantListItem } from "@/lib/types";

export type Trend = "up" | "down" | "flat";

type Props = {
  plants: PlantListItem[];
  selectedId: number | null;
  onSelectPlant: (id: number) => void;
  trends?: Record<number, Trend>;
};

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === "flat") return <span className="trend-arrow trend-arrow--flat">—</span>;
  return (
    <span className={`trend-arrow trend-arrow--${trend}`} aria-label={trend === "up" ? "rising" : "falling"}>
      {trend === "up" ? "↑" : "↓"}
    </span>
  );
}

export function PlantRail({ plants, selectedId, onSelectPlant, trends = {} }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <nav className="plant-rail" aria-label="All plants">
      <p className="plant-rail__heading">Garden ({plants.length})</p>
      <ul>
        {plants.map((plant) => {
          const pct = Math.round(plant.current_moisture * 100);
          const trend = trends[plant.id] ?? "flat";
          return (
            <li key={plant.id}>
              <motion.button
                type="button"
                className={`plant-rail__item ${selectedId === plant.id ? "is-selected" : ""}`}
                onClick={() => onSelectPlant(plant.id)}
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className={`dot ${plant.needs_watering ? "needs" : "ok"}`} aria-hidden />
                <span className="plant-rail__name">{plant.name}</span>
                <TrendArrow trend={trend} />
                <span className="plant-rail__pct">{pct}%</span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
