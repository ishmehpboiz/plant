/** 2D map positions (% of garden-map container). */

export type PlantKind = "palm" | "banana" | "tree" | "shrub" | "flowering";

export type MapSlot = {
  x: number;
  y: number;
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
