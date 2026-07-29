/**
 * Hardcoded mock responses matching PROJECT_BRIEF.md contract shapes.
 * Swap consumers to real fetch via lib/api.ts when the backend is wired.
 *
 * Species / Kc values mirror backend/app/kc_table.py (Kanyakumari set).
 */

import type { PlantHistory, PlantListItem, WateringLogEntry } from "./types";

/** Approx. Kanyakumari, Tamil Nadu */
export const KANYAKUMARI = { lat: 8.0883, lng: 77.5385 };

export const MOCK_PLANTS: PlantListItem[] = [
  {
    id: 1,
    name: "Front yard coconut",
    species: "Cocos nucifera",
    kc: 1.0,
    wilting_point: 0.12,
    field_capacity: 0.42,
    current_moisture: 0.38,
    needs_watering: false,
  },
  {
    id: 2,
    name: "Banana by the wall",
    species: "Musa spp.",
    kc: 1.2,
    wilting_point: 0.18,
    field_capacity: 0.48,
    current_moisture: 0.2,
    needs_watering: true,
  },
  {
    id: 3,
    name: "Mango — east plot",
    species: "Mangifera indica",
    kc: 0.85,
    wilting_point: 0.12,
    field_capacity: 0.42,
    current_moisture: 0.31,
    needs_watering: false,
  },
  {
    id: 4,
    name: "Curry leaf bush",
    species: "Murraya koenigii",
    kc: 0.35,
    wilting_point: 0.1,
    field_capacity: 0.4,
    current_moisture: 0.11,
    needs_watering: true,
  },
  {
    id: 5,
    name: "Jasmine (malli)",
    species: "Jasminum sambac",
    kc: 0.55,
    wilting_point: 0.15,
    field_capacity: 0.45,
    current_moisture: 0.28,
    needs_watering: false,
  },
];

/** Species returned by mocked Plant.id for add-plant flow */
export const MOCK_SPECIES_BY_NAME: Record<
  string,
  { species: string; kc: number; wilting_point: number; field_capacity: number }
> = {
  coconut: {
    species: "Cocos nucifera",
    kc: 1.0,
    wilting_point: 0.12,
    field_capacity: 0.42,
  },
  banana: {
    species: "Musa spp.",
    kc: 1.2,
    wilting_point: 0.18,
    field_capacity: 0.48,
  },
  mango: {
    species: "Mangifera indica",
    kc: 0.85,
    wilting_point: 0.12,
    field_capacity: 0.42,
  },
  jackfruit: {
    species: "Artocarpus heterophyllus",
    kc: 1.0,
    wilting_point: 0.12,
    field_capacity: 0.42,
  },
  rubber: {
    species: "Hevea brasiliensis",
    kc: 1.0,
    wilting_point: 0.12,
    field_capacity: 0.42,
  },
  tea: {
    species: "Camellia sinensis",
    kc: 1.0,
    wilting_point: 0.15,
    field_capacity: 0.45,
  },
  coffee: {
    species: "Coffea spp.",
    kc: 0.95,
    wilting_point: 0.15,
    field_capacity: 0.45,
  },
  areca: {
    species: "Areca catechu",
    kc: 1.0,
    wilting_point: 0.12,
    field_capacity: 0.42,
  },
  cassava: {
    species: "Manihot esculenta",
    kc: 1.1,
    wilting_point: 0.18,
    field_capacity: 0.48,
  },
  pepper: {
    species: "Piper nigrum",
    kc: 0.85,
    wilting_point: 0.18,
    field_capacity: 0.48,
  },
  papaya: {
    species: "Carica papaya",
    kc: 0.75,
    wilting_point: 0.18,
    field_capacity: 0.48,
  },
  curry: {
    species: "Murraya koenigii",
    kc: 0.35,
    wilting_point: 0.1,
    field_capacity: 0.4,
  },
  moringa: {
    species: "Moringa oleifera",
    kc: 0.35,
    wilting_point: 0.1,
    field_capacity: 0.4,
  },
  hibiscus: {
    species: "Hibiscus rosa-sinensis",
    kc: 0.55,
    wilting_point: 0.15,
    field_capacity: 0.45,
  },
  jasmine: {
    species: "Jasminum sambac",
    kc: 0.55,
    wilting_point: 0.15,
    field_capacity: 0.45,
  },
};

function isoDaysAgo(daysAgo: number): string {
  const d = new Date("2026-07-29T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function buildHistory(
  plantId: number,
  startMoisture: number,
  wilting: number,
  field: number,
  days = 30,
): PlantHistory {
  const history = [];
  let moisture = startMoisture;

  for (let i = days - 1; i >= 0; i--) {
    const et0 = 3.2 + Math.sin(i / 4) * 0.6 + (i % 5) * 0.05;
    const rainfall = i % 7 === 0 ? 4.5 + (i % 3) : i % 11 === 0 ? 12.0 : 0;
    const irrigated = i === 12 || i === 3;
    const irrigationBoost = irrigated ? 0.08 : 0;
    const etc = (et0 * 0.001) * 0.9; // scaled for volumetric fraction mock
    moisture = Math.min(
      field,
      Math.max(wilting, moisture + rainfall * 0.002 + irrigationBoost - etc),
    );

    history.push({
      date: isoDaysAgo(i),
      moisture: Math.round(moisture * 1000) / 1000,
      et0: Math.round(et0 * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
      irrigated,
    });
  }

  return { plant_id: plantId, history };
}

export const MOCK_HISTORY: Record<number, PlantHistory> = Object.fromEntries(
  MOCK_PLANTS.map((p) => [
    p.id,
    buildHistory(p.id, p.current_moisture, p.wilting_point, p.field_capacity),
  ]),
);

/** Seed the watering log from the `irrigated` days already baked into MOCK_HISTORY. */
export const MOCK_WATERING_LOG: WateringLogEntry[] = MOCK_PLANTS.flatMap((plant) =>
  MOCK_HISTORY[plant.id].history
    .filter((day) => day.irrigated)
    .map((day) => ({
      plant_id: plant.id,
      plant_name: plant.name,
      amount_liters: 3 + ((plant.id * 7) % 6), // plausible per-plant variety, not a real reading
      watered_at: day.date,
    })),
).sort((a, b) => (a.watered_at < b.watered_at ? 1 : -1));
