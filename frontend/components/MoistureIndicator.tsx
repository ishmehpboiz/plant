"use client";

import { motion, useReducedMotion } from "motion/react";

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
  const wiltPct = Math.round(wiltingPoint * 100);
  const fieldPct = Math.round(fieldCapacity * 100);
  const reduceMotion = useReducedMotion();

  return (
    <div className="moisture">
      <div className="moisture__meta">
        <span className="moisture__label">Soil moisture</span>
        <span className={`moisture__status ${needsWatering ? "is-dry" : "is-ok"}`}>
          {needsWatering ? "Needs watering" : "Looking good"}
        </span>
      </div>

      <div className="moisture__gauge" aria-hidden>
        <div className="column-shell moisture__column">
          <div className="tick" style={{ bottom: `${wiltPct}%` }} />
          <div className="tick" style={{ bottom: `${fieldPct}%` }} />
          <motion.div
            className="column-fill moisture__fill"
            initial={reduceMotion ? false : { height: 0 }}
            animate={{ height: `${pct * 100}%` }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 18 }}
          />
          {!reduceMotion && (
            <motion.div
              className="moisture__ripple"
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.04, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ bottom: `${pct * 100}%` }}
            />
          )}
        </div>
        <div className="moisture__scale">
          <span>field {fieldPct}%</span>
          <span>wilt {wiltPct}%</span>
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
