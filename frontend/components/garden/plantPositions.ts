/** 2D map positions (% of garden-map container). */

import type { PlantListItem } from "@/lib/types";

export type PlantKind = "palm" | "banana" | "tree" | "shrub" | "flowering";

export type MapSlot = {
  x: number;
  y: number;
  /** Fallback only, for species this table doesn't recognize. */
  kind: PlantKind;
};

export const MAP_SLOTS: MapSlot[] = [
  { x: 24, y: 38, kind: "palm" },
  { x: 42, y: 55, kind: "banana" },
  { x: 52, y: 42, kind: "tree" },
  { x: 30, y: 62, kind: "shrub" },
  { x: 68, y: 36, kind: "flowering" },
  { x: 72, y: 58, kind: "tree" },
  { x: 48, y: 28, kind: "shrub" },
  { x: 78, y: 48, kind: "palm" },
];

export function mapSlotForPlant(id: number): MapSlot {
  return MAP_SLOTS[(id - 1) % MAP_SLOTS.length];
}

/** Growth-form bucket per species (mirrors backend/app/kc_table.py's 15 species). */
const KIND_BY_SPECIES: Record<string, PlantKind> = {
  "Cocos nucifera": "palm",
  "Areca catechu": "palm",
  "Musa spp.": "banana",
  "Mangifera indica": "tree",
  "Artocarpus heterophyllus": "tree",
  "Hevea brasiliensis": "tree",
  "Carica papaya": "tree",
  "Camellia sinensis": "shrub",
  "Coffea spp.": "shrub",
  "Manihot esculenta": "shrub",
  "Murraya koenigii": "shrub",
  "Moringa oleifera": "shrub",
  "Hibiscus rosa-sinensis": "flowering",
  "Jasminum sambac": "flowering",
  "Piper nigrum": "flowering",
};

export function kindForPlant(plant: PlantListItem): PlantKind {
  return KIND_BY_SPECIES[plant.species] ?? mapSlotForPlant(plant.id).kind;
}
