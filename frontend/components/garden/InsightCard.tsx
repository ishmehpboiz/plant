"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function InsightCard({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="insight-card"
      whileHover={reduceMotion ? undefined : { y: -3, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{ transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}
