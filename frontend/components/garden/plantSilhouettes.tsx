/**
 * Small stylized SVG silhouette per plant growth form. Flat, simple shapes —
 * intentionally not photorealistic. One shape per `PlantKind`, sized so a
 * palm reads taller than a shrub (real-world scale, not uniform stamping).
 */

import type { ReactElement } from "react";
import type { PlantKind } from "./plantPositions";

export const KIND_SCALE: Record<PlantKind, number> = {
  palm: 1.35,
  tree: 1.15,
  banana: 1.05,
  flowering: 0.85,
  shrub: 0.75,
};

/** Base render height (px) at scale 1 — used to size the shadow ellipse under each pin. */
export const KIND_BASE_HEIGHT = 64;

type SilhouetteProps = {
  kind: PlantKind;
  className?: string;
};

function PalmSilhouette() {
  return (
    <svg viewBox="0 0 44 72" width="44" height="72" aria-hidden>
      <path d="M 22 72 L 20 30 Q 22 24 24 30 L 22 72 Z" fill="#6b5038" />
      {[
        "M 21 30 Q 4 20 2 6",
        "M 21 30 Q 8 26 4 16",
        "M 21 29 Q 40 18 42 4",
        "M 21 29 Q 36 24 40 15",
        "M 21 28 Q 22 12 20 2",
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#3f7a45" strokeWidth="4" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function BananaSilhouette() {
  return (
    <svg viewBox="0 0 44 60" width="44" height="60" aria-hidden>
      <path d="M 22 60 L 20 30 Q 22 26 24 30 L 22 60 Z" fill="#5c7a3a" />
      <path d="M 22 32 Q 4 26 3 10 Q 18 14 22 32 Z" fill="#4d8b4a" />
      <path d="M 22 30 Q 40 24 41 8 Q 26 12 22 30 Z" fill="#5a9e55" />
      <path d="M 22 28 Q 10 14 12 2 Q 24 10 22 28 Z" fill="#4d8b4a" opacity="0.9" />
    </svg>
  );
}

function TreeSilhouette() {
  return (
    <svg viewBox="0 0 44 60" width="44" height="60" aria-hidden>
      <path d="M 23 60 L 21 34 Q 23 30 25 34 L 23 60 Z" fill="#6b5038" />
      <ellipse cx="22" cy="22" rx="20" ry="18" fill="#4d8b4a" />
      <ellipse cx="16" cy="16" rx="11" ry="10" fill="#5a9e55" opacity="0.85" />
    </svg>
  );
}

function ShrubSilhouette() {
  return (
    <svg viewBox="0 0 48 34" width="48" height="34" aria-hidden>
      <ellipse cx="24" cy="22" rx="23" ry="12" fill="#3f7a45" />
      <ellipse cx="16" cy="16" rx="13" ry="9" fill="#5a9e55" opacity="0.85" />
      <ellipse cx="33" cy="18" rx="11" ry="8" fill="#4d8b4a" opacity="0.9" />
    </svg>
  );
}

function FloweringSilhouette() {
  return (
    <svg viewBox="0 0 48 42" width="48" height="42" aria-hidden>
      <path d="M 6 30 Q 16 8 40 12" fill="none" stroke="#5c7a3a" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="22" cy="26" rx="20" ry="11" fill="#4d8b4a" />
      <ellipse cx="15" cy="20" rx="10" ry="7" fill="#5a9e55" opacity="0.85" />
      {[
        [12, 16],
        [22, 10],
        [31, 17],
        [18, 24],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.4" fill="#fdf6e3" stroke="#e8c468" strokeWidth="0.75" />
      ))}
    </svg>
  );
}

const SILHOUETTES: Record<PlantKind, () => ReactElement> = {
  palm: PalmSilhouette,
  banana: BananaSilhouette,
  tree: TreeSilhouette,
  shrub: ShrubSilhouette,
  flowering: FloweringSilhouette,
};

export function PlantSilhouette({ kind, className }: SilhouetteProps) {
  const Shape = SILHOUETTES[kind];
  return (
    <span className={className} aria-hidden>
      <Shape />
    </span>
  );
}
