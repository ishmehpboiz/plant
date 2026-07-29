"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { PlantListItem } from "@/lib/types";

type Props = {
  plants: PlantListItem[];
};

export function PlantList({ plants }: Props) {
  if (plants.length === 0) {
    return (
      <p className="empty">
        No plants yet.{" "}
        <Link href="/plants/new">Add your first garden plant</Link>.
      </p>
    );
  }

  return (
    <ul className="plant-list">
      {plants.map((plant, i) => {
        const pct = Math.round(plant.current_moisture * 100);
        return (
          <motion.li
            key={plant.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Link href={`/plants/${plant.id}`} className="plant-row">
              <div className="plant-row__main">
                <span className="plant-row__name">{plant.name}</span>
                <span className="plant-row__species">{plant.species}</span>
              </div>
              <div className="plant-row__side">
                <span
                  className={`pill ${plant.needs_watering ? "pill--warn" : "pill--ok"}`}
                >
                  {plant.needs_watering ? "Needs water" : "Ok"}
                </span>
                <span className="plant-row__moisture">{pct}%</span>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
