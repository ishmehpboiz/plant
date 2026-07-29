/** Shapes from PROJECT_BRIEF.md Shared API Contract — do not deviate. */

export type Plant = {
  id: number;
  name: string;
  species: string;
  kc: number;
  wilting_point: number;
  field_capacity: number;
  current_moisture: number;
};

export type PlantListItem = Plant & {
  needs_watering: boolean;
};

export type MoistureHistoryPoint = {
  date: string;
  moisture: number;
  et0: number;
  rainfall: number;
  irrigated: boolean;
};

export type PlantHistory = {
  plant_id: number;
  history: MoistureHistoryPoint[];
};

export type CreatePlantRequest = {
  name: string;
  photo_base64: string;
  location_lat: number;
  location_lng: number;
};

export type WaterRequest = {
  amount_liters?: number;
};

export type WateringLogEntry = {
  plant_id: number;
  plant_name: string;
  amount_liters: number;
  watered_at: string; // ISO date or datetime
};
