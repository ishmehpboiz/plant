"use client";

import { motion } from "motion/react";

type Props = {
  moisture: number;
  wiltingPoint: number;
  fieldCapacity: number;
  needsWatering: boolean;
};

export function MoistureIndicator({
  moisture,
  wiltingPoint,
  fieldCapacity,
  needsWatering,
}: Props) {
  const span = fieldCapacity - wiltingPoint || 1;
  const pct = Math.min(1, Math.max(0, (moisture - wiltingPoint) / span));
  const percentLabel = Math.round(moisture * 100);

  return (
    <div className="moisture">
      <div className="moisture__meta">
        <span className="moisture__label">Soil moisture</span>
        <span className={`moisture__status ${needsWatering ? "is-dry" : "is-ok"}`}>
          {needsWatering ? "Needs watering" : "Looking good"}
        </span>
      </div>

      <div className="moisture__gauge" aria-hidden>
        <div className="moisture__track">
          <motion.div
            className="moisture__fill"
            initial={{ height: 0 }}
            animate={{ height: `${pct * 100}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
          />
          <motion.div
            className="moisture__ripple"
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: `${pct * 100}%` }}
          />
        </div>
        <div className="moisture__scale">
          <span>field {Math.round(fieldCapacity * 100)}%</span>
          <span>wilt {Math.round(wiltingPoint * 100)}%</span>
        </div>
      </div>

      <motion.p
        className="moisture__value"
        key={percentLabel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {percentLabel}
        <span>%</span>
      </motion.p>
    </div>
  );
}
