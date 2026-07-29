/**
 * API client. Currently backed by mocks; flip USE_MOCKS to false and set
 * NEXT_PUBLIC_API_URL when pointing at the live FastAPI backend.
 */

import { KANYAKUMARI, MOCK_HISTORY, MOCK_PLANTS, MOCK_SPECIES_BY_NAME } from "./mocks";
import type {
  CreatePlantRequest,
  Plant,
  PlantHistory,
  PlantListItem,
  WaterRequest,
} from "./types";

const USE_MOCKS = true;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

let plantsStore: PlantListItem[] = structuredClone(MOCK_PLANTS);
let nextId = Math.max(...plantsStore.map((p) => p.id)) + 1;
const historyStore: Record<number, PlantHistory> = structuredClone(MOCK_HISTORY);

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

  const { needs_watering: _, ...out } = updated;
  return out;
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

export { KANYAKUMARI, USE_MOCKS };
