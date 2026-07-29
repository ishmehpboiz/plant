"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PlantListItem } from "@/lib/types";

type Props = {
  plants: PlantListItem[];
};

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Deliberately the plain average of each plant's current_moisture -- the same
 * number shown in the rail/actions list -- not a normalized "health score".
 * A gauge showing a different metric than the numbers right next to it reads
 * as broken math, even when the underlying metric is technically defensible.
 */
export function GardenHealthGauge({ plants }: Props) {
  const reduceMotion = useReducedMotion();
  const healthPct = plants.length
    ? Math.round((plants.reduce((sum, p) => sum + p.current_moisture, 0) / plants.length) * 100)
    : 0;

  const isLow = healthPct < 22;
  const isMid = healthPct >= 22 && healthPct < 38;
  const gradientId = isLow ? "gaugeGradLow" : isMid ? "gaugeGradMid" : "gaugeGradHigh";
  const statusWord = isLow ? "Needs attention" : isMid ? "Doing okay" : "Thriving";

  const dashOffset = CIRCUMFERENCE * (1 - healthPct / 100);

  return (
    <div className="health-gauge">
      <svg viewBox="0 0 120 120" width="120" height="120" className="health-gauge__svg">
        <defs>
          <linearGradient id="gaugeGradHigh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--teal-light)" />
            <stop offset="100%" stopColor="var(--leaf)" />
          </linearGradient>
          <linearGradient id="gaugeGradMid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8c468" />
            <stop offset="100%" stopColor="var(--teal)" />
          </linearGradient>
          <linearGradient id="gaugeGradLow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3c4a8" />
            <stop offset="100%" stopColor="var(--laterite)" />
          </linearGradient>
        </defs>

        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          transform="rotate(-90 60 60)"
          initial={reduceMotion ? false : { strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.1, ease: [0.22, 0.9, 0.3, 1] }}
        />
      </svg>
      <div className="health-gauge__center">
        <span className="health-gauge__pct">{healthPct}%</span>
        <span className="health-gauge__status">{statusWord}</span>
      </div>
    </div>
  );
}
