"use client";

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";

/** Tiny drifting motes across the whole page -- extremely subtle, purely
 * atmospheric. Positions/timings are randomized once per mount, not on
 * every render. */
export function ParticleField({ count = 16 }: { count?: number }) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 2.5,
        duration: 18 + Math.random() * 14,
        delay: Math.random() * -20,
        drift: 20 + Math.random() * 40,
      })),
    [count],
  );

  if (reduceMotion) return null;

  return (
    <div className="particle-field" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-field__mote"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift-x": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
