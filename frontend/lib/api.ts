/**
 * API client. Currently backed by mocks; flip USE_MOCKS to false and set
 * NEXT_PUBLIC_API_URL when pointing at the live FastAPI backend.
 */

import { KANYAKUMARI, MOCK_HISTORY, MOCK_PLANTS, MOCK_SPECIES_BY_NAME, MOCK_WATERING_LOG } from "./mocks";
import type {
  CreatePlantRequest,
  Plant,
  PlantHistory,
  PlantListItem,
  WateringLogEntry,
  WaterRequest,
} from "./types";

const USE_MOCKS = true;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

let plantsStore: PlantListItem[] = structuredClone(MOCK_PLANTS);
let nextId = Math.max(...plantsStore.map((p) => p.id)) + 1;
const historyStore: Record<number, PlantHistory> = structuredClone(MOCK_HISTORY);
let wateringLogStore: WateringLogEntry[] = structuredClone(MOCK_WATERING_LOG);

function delay(ms = 280): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function needsWatering(plant: Plant): boolean {
  const threshold = plant.wilting_point + (plant.field_capacity - plant.wilting_point) * 0.25;
  return plant.current_moisture <= threshold;
}

function guessSpecies(name: string) {
  const lower = name.toLowerCase();
  for (const [key, profile] of Object.entries(MOCK_SPECIES_BY_NAME)) {
    if (lower.includes(key)) return profile;
  }
  return {
    species: "Cocos nucifera",
    kc: 1.0,
    wilting_point: 0.12,
    field_capacity: 0.42,
  };
}

async function mockGetPlants(): Promise<PlantListItem[]> {
  await delay();
  return structuredClone(plantsStore);
}

async function mockGetPlant(id: number): Promise<PlantListItem | null> {
  await delay();
  const plant = plantsStore.find((p) => p.id === id);
  return plant ? structuredClone(plant) : null;
}

async function mockCreatePlant(body: CreatePlantRequest): Promise<Plant> {
  await delay(500);
  const profile = guessSpecies(body.name);
  const plant: PlantListItem = {
    id: nextId++,
    name: body.name,
    species: profile.species,
    kc: profile.kc,
    wilting_point: profile.wilting_point,
    field_capacity: profile.field_capacity,
    current_moisture: profile.field_capacity,
    needs_watering: false,
  };
  plantsStore = [...plantsStore, plant];
  historyStore[plant.id] = {
    plant_id: plant.id,
    history: [
      {
        date: new Date().toISOString().slice(0, 10),
        moisture: plant.current_moisture,
        et0: 3.4,
        rainfall: 0,
        irrigated: false,
      },
    ],
  };
  const { needs_watering: _, ...out } = plant;
  return out;
}

async function mockGetHistory(id: number, days = 30): Promise<PlantHistory> {
  await delay();
  const full = historyStore[id] ?? { plant_id: id, history: [] };
  return {
    plant_id: id,
    history: full.history.slice(-days),
  };
}

async function mockWater(id: number, body: WaterRequest = {}): Promise<Plant> {
  await delay(350);
  const idx = plantsStore.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`Plant ${id} not found`);

  const amount = body.amount_liters ?? 0.5;
  const plant = plantsStore[idx];
  const boost = Math.min(0.12, amount * 0.1);
  const updated: PlantListItem = {
    ...plant,
    current_moisture: Math.min(plant.field_capacity, plant.current_moisture + boost),
  };
  updated.needs_watering = needsWatering(updated);
  plantsStore = [...plantsStore.slice(0, idx), updated, ...plantsStore.slice(idx + 1)];

  const hist = historyStore[id];
  if (hist) {
    const today = new Date().toISOString().slice(0, 10);
    const last = hist.history[hist.history.length - 1];
    if (last?.date === today) {
      last.moisture = updated.current_moisture;
      last.irrigated = true;
    } else {
      hist.history.push({
        date: today,
        moisture: updated.current_moisture,
        et0: last?.et0 ?? 3.2,
        rainfall: 0,
        irrigated: true,
      });
    }
  }

  wateringLogStore = [
    { plant_id: id, plant_name: plant.name, amount_liters: amount, watered_at: new Date().toISOString() },
    ...wateringLogStore,
  ];

  const { needs_watering: _, ...out } = updated;
  return out;
}

async function mockGetRecentWaterings(limit: number): Promise<WateringLogEntry[]> {
  await delay(150);
  return structuredClone(wateringLogStore.slice(0, limit));
}

async function mockGetAllHistories(days: number): Promise<Record<number, PlantHistory>> {
  await delay(200);
  const out: Record<number, PlantHistory> = {};
  for (const plant of plantsStore) {
    const full = historyStore[plant.id] ?? { plant_id: plant.id, history: [] };
    out[plant.id] = { plant_id: plant.id, history: full.history.slice(-days) };
  }
  return structuredClone(out);
}

async function liveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getPlants(): Promise<PlantListItem[]> {
  if (USE_MOCKS) return mockGetPlants();
  return liveFetch<PlantListItem[]>("/api/plants");
}

export async function getPlant(id: number): Promise<PlantListItem | null> {
  if (USE_MOCKS) return mockGetPlant(id);
  const plants = await liveFetch<PlantListItem[]>("/api/plants");
  return plants.find((p) => p.id === id) ?? null;
}

export async function createPlant(body: CreatePlantRequest): Promise<Plant> {
  if (USE_MOCKS) return mockCreatePlant(body);
  return liveFetch<Plant>("/api/plants", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getPlantHistory(id: number, days = 30): Promise<PlantHistory> {
  if (USE_MOCKS) return mockGetHistory(id, days);
  return liveFetch<PlantHistory>(`/api/plants/${id}/history?days=${days}`);
}

export async function waterPlant(id: number, body: WaterRequest = {}): Promise<Plant> {
  if (USE_MOCKS) return mockWater(id, body);
  return liveFetch<Plant>(`/api/plants/${id}/water`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** All plants' moisture history in one call -- used by the multi-plant trend strip. */
export async function getAllHistories(days = 30): Promise<Record<number, PlantHistory>> {
  if (USE_MOCKS) return mockGetAllHistories(days);
  const plants = await liveFetch<PlantListItem[]>("/api/plants");
  const entries = await Promise.all(
    plants.map(async (p) => [p.id, await getPlantHistory(p.id, days)] as const),
  );
  return Object.fromEntries(entries);
}

/**
 * Recent watering events across the garden. The frozen API contract has no
 * "list watering events" endpoint (only POST .../water to create one), so in
 * live mode this is approximated from moisture_history's `irrigated` flag --
 * real dates, but no real amount_liters (shown as unknown rather than
 * invented). Mock mode has the real seeded amounts.
 */
export async function getRecentWaterings(limit = 8): Promise<WateringLogEntry[]> {
  if (USE_MOCKS) return mockGetRecentWaterings(limit);

  const plants = await liveFetch<PlantListItem[]>("/api/plants");
  const histories = await getAllHistories(30);
  const events: WateringLogEntry[] = [];
  for (const plant of plants) {
    for (const day of histories[plant.id]?.history ?? []) {
      if (day.irrigated) {
        events.push({ plant_id: plant.id, plant_name: plant.name, amount_liters: NaN, watered_at: day.date });
      }
    }
  }
  return events.sort((a, b) => (a.watered_at < b.watered_at ? 1 : -1)).slice(0, limit);
}

export { KANYAKUMARI, USE_MOCKS };
