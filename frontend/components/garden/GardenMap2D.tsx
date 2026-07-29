"use client";

import type { PlantListItem } from "@/lib/types";
import { plantMapLabel } from "./plantMapLabel";
import { kindForPlant, mapSlotForPlant } from "./plantPositions";
import { KIND_SCALE, PlantSilhouette } from "./plantSilhouettes";

type Props = {
  plants: PlantListItem[];
  selectedId: number | null;
  onSelectPlant: (id: number) => void;
};

function moisturePct(moisture: number) {
  return Math.round(moisture * 100);
}

/** Stepping-stone path: fountain → lawn center → bottom gate (fully resolved, no tail). */
const PATH_STONES: Array<[number, number, number]> = [
  [175, 228, -6],
  [205, 248, -5],
  [238, 268, -4],
  [272, 288, -3],
  [308, 308, -2],
  [348, 328, -1],
  [388, 352, 0],
  [418, 378, 2],
  [408, 408, 4],
  [392, 438, 3],
];

export function GardenMap2D({ plants, selectedId, onSelectPlant }: Props) {
  return (
    <div className="garden-map">
      <svg
        className="garden-map__svg"
        viewBox="0 0 800 560"
        role="img"
        aria-label="Kanyakumari garden map"
      >
        <defs>
          <linearGradient id="lawnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aad5c" />
            <stop offset="100%" stopColor="#5f9448" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ec4c2" />
            <stop offset="100%" stopColor="#4a8f8d" />
          </linearGradient>
          <filter id="shrubFront" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#26241f" floodOpacity="0.22" />
          </filter>

          {/* Subtle grain so the lawn isn't one flat fill */}
          <filter id="grassGrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.1
                      0 0 0 0 0.2
                      0 0 0 0 0.08
                      0 0 0 0.05 0"
            />
          </filter>

          <clipPath id="lawnClip">
            <path d="M 90 120 Q 400 90 710 130 L 700 480 Q 400 510 100 460 Z" />
          </clipPath>
        </defs>

        {/* Outer ground */}
        <rect x="0" y="0" width="800" height="560" fill="#8a9a6e" />

        {/* Plot enclosure — consistent on all four sides */}
        <rect x="40" y="48" width="720" height="28" rx="2" fill="#c9a87a" />
        <rect x="40" y="48" width="720" height="6" fill="#d4b88a" opacity="0.5" />
        <rect x="732" y="48" width="28" height="464" rx="2" fill="#c9a87a" />
        <rect x="40" y="480" width="720" height="28" rx="2" fill="#c9a87a" />
        <rect x="40" y="494" width="720" height="6" fill="#d4b88a" opacity="0.5" />

        {/* Left wooden fence */}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect
            key={i}
            x="44"
            y={80 + i * 30}
            width="8"
            height="22"
            rx="1"
            fill="#8b6b4a"
          />
        ))}

        {/* Bottom gate (path endpoint) */}
        <rect x="368" y="478" width="64" height="14" rx="2" fill="#8a9a6e" />
        <path
          d="M 372 478 L 372 468 Q 400 458 428 468 L 428 478"
          fill="none"
          stroke="#6b5038"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Main lawn — single inner edge, no duplicate outer stroke */}
        <path
          d="M 90 120 Q 400 90 710 130 L 700 480 Q 400 510 100 460 Z"
          fill="url(#lawnGrad)"
        />
        <rect x="90" y="90" width="620" height="420" filter="url(#grassGrain)" clipPath="url(#lawnClip)" opacity="0.5" />

        {/* Garden-bed / mulch zone — a second distinguishable ground material
            under the planted cluster, so the lawn isn't one uniform color */}
        <path
          d="M 165 200 Q 320 175 470 215 Q 520 260 470 340 Q 340 400 210 375 Q 150 300 165 200 Z"
          fill="#a67b4f"
          opacity="0.35"
          clipPath="url(#lawnClip)"
        />
        <path
          d="M 165 200 Q 320 175 470 215 Q 520 260 470 340 Q 340 400 210 375 Q 150 300 165 200 Z"
          fill="none"
          stroke="#8a6238"
          strokeWidth="1.5"
          strokeDasharray="3 5"
          opacity="0.4"
          clipPath="url(#lawnClip)"
        />

        {/* Curved flower border — left (back + front with depth) */}
        <ellipse cx="175" cy="370" rx="70" ry="45" fill="#8a6aa8" opacity="0.75" />
        <ellipse
          cx="200"
          cy="350"
          rx="50"
          ry="35"
          fill="#b89ad0"
          opacity="0.9"
          filter="url(#shrubFront)"
          stroke="#6b5088"
          strokeWidth="1.5"
        />

        {/* Flower border — lower right */}
        <ellipse cx="630" cy="420" rx="65" ry="40" fill="#8a6aa8" opacity="0.75" />
        <ellipse
          cx="655"
          cy="405"
          rx="48"
          ry="32"
          fill="#9a7ab8"
          opacity="0.9"
          filter="url(#shrubFront)"
          stroke="#6b5088"
          strokeWidth="1.5"
        />

        {/* Lavender cluster upper-right (replaces ambiguous grey oval) */}
        <ellipse cx="592" cy="188" rx="28" ry="18" fill="#9a7ab8" opacity="0.8" />
        <ellipse
          cx="608"
          cy="178"
          rx="22"
          ry="14"
          fill="#b89ad0"
          opacity="0.9"
          filter="url(#shrubFront)"
          stroke="#6b5088"
          strokeWidth="1.5"
        />

        {/* Soft animated flow along the path, suggesting water reaching the plants */}
        <path
          className="garden-map__flow-path"
          d={`M ${PATH_STONES.map(([x, y]) => `${x + 14},${y + 10}`).join(" L ")}`}
          fill="none"
          stroke="var(--teal)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Stepping stone path — ends at bottom gate */}
        {PATH_STONES.map(([x, y, rot], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="28"
            height="20"
            rx="3"
            fill="#c9b89a"
            stroke="#a89878"
            strokeWidth="1"
            transform={`rotate(${rot} ${x + 14} ${y + 10})`}
          />
        ))}

        {/* Fountain */}
        <ellipse cx="155" cy="210" rx="48" ry="28" fill="#b8b0a0" />
        <ellipse cx="155" cy="200" rx="38" ry="22" fill="url(#waterGrad)" />
        <ellipse cx="155" cy="195" rx="12" ry="8" fill="#a8d8d6" />

        {/* Pond — lower right, away from jasmine pin */}
        <ellipse cx="640" cy="395" rx="52" ry="34" fill="url(#waterGrad)" />
        <ellipse cx="630" cy="387" rx="20" ry="12" fill="#a8d8d6" opacity="0.6" />

        {/* Decorative trees */}
        <g transform="translate(120, 130)">
          <rect x="18" y="28" width="8" height="22" fill="#5c4030" />
          <polygon points="22,8 38,36 6,36" fill="#e89545" />
        </g>
        <g transform="translate(650, 120)">
          <rect x="18" y="28" width="8" height="22" fill="#5c4030" />
          <polygon points="22,8 38,36 6,36" fill="#5a9e55" />
        </g>
        <g transform="translate(400, 95)">
          <rect x="14" y="22" width="6" height="18" fill="#5c4030" />
          <polygon points="17,6 30,28 4,28" fill="#e89545" />
        </g>
        <g transform="translate(700, 450)">
          <rect x="14" y="22" width="6" height="18" fill="#5c4030" />
          <polygon points="17,6 30,28 4,28" fill="#5a9e55" />
        </g>

        <text x="400" y="530" textAnchor="middle" fontSize="11" fill="#59564b" fontFamily="monospace">
          ~20m × 16m · Kanyakumari Garden
        </text>
      </svg>

      {plants.map((plant) => {
        const slot = mapSlotForPlant(plant.id);
        const kind = kindForPlant(plant);
        const pct = moisturePct(plant.current_moisture);
        const selected = selectedId === plant.id;
        const label = plantMapLabel(plant);

        return (
          <button
            key={plant.id}
            type="button"
            className={`garden-pin ${selected ? "is-selected" : ""} ${plant.needs_watering ? "needs-water" : ""}`}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            onClick={() => onSelectPlant(plant.id)}
            aria-label={`${plant.name}, ${pct}% moisture`}
          >
            <div
              className="garden-pin__stack"
              style={{ transform: `scale(${KIND_SCALE[kind]})` }}
            >
              {plant.needs_watering && <div className="garden-pin__glow" aria-hidden />}
              <PlantSilhouette kind={kind} className="garden-pin__plant" />
              <div className="garden-pin__column" aria-hidden>
                <div className="garden-pin__fill" style={{ height: `${pct}%` }} />
              </div>
              <div className="garden-pin__shadow" aria-hidden />
            </div>
            <span className="garden-pin__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
