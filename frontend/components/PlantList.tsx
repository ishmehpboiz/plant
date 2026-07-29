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
        const wiltPct = Math.round(plant.wilting_point * 100);
        const fcPct = Math.round(plant.field_capacity * 100);
        return (
          <motion.li
            key={plant.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Link href={`/plants/${plant.id}`} className="plant-card">
              <div className="column-shell" aria-hidden>
                <div className="tick" style={{ bottom: `${wiltPct}%` }} />
                <div className="tick" style={{ bottom: `${fcPct}%` }} />
                <motion.div
                  className="column-fill"
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ delay: i * 0.06, duration: 0.9, ease: "easeOut" }}
                />
              </div>

              <div className="plant-card__main">
                <p className="plant-name">{plant.name}</p>
                <p className="plant-species">{plant.species}</p>

                <span
                  className={`status-badge ${plant.needs_watering ? "needs" : "ok"}`}
                >
                  <span className="dot" />
                  {plant.needs_watering ? "Needs water" : "Healthy"}
                </span>

                <div className="metrics">
                  <span>
                    Kc <b>{plant.kc.toFixed(2)}</b>
                  </span>
                  <span>
                    Moisture <b>{pct}%</b>
                  </span>
                </div>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
