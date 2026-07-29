import type { PlantListItem } from "@/lib/types";

/** Short labels for map pins — full name stays in the detail panel. */
const SPECIES_LABEL: Record<string, string> = {
  "Cocos nucifera": "Coconut",
  "Musa spp.": "Banana",
  "Mangifera indica": "Mango",
  "Murraya koenigii": "Curry Leaf",
  "Jasminum sambac": "Jasmine",
  "Artocarpus heterophyllus": "Jackfruit",
  "Hevea brasiliensis": "Rubber",
  "Camellia sinensis": "Tea",
  "Coffea spp.": "Coffee",
  "Areca catechu": "Areca",
  "Manihot esculenta": "Cassava",
  "Piper nigrum": "Pepper",
  "Carica papaya": "Papaya",
  "Moringa oleifera": "Moringa",
  "Hibiscus rosa-sinensis": "Hibiscus",
};

const NAME_KEYWORDS: Array<{ match: string; label: string }> = [
  { match: "coconut", label: "Coconut" },
  { match: "banana", label: "Banana" },
  { match: "mango", label: "Mango" },
  { match: "curry", label: "Curry Leaf" },
  { match: "jasmine", label: "Jasmine" },
  { match: "malli", label: "Jasmine" },
  { match: "jackfruit", label: "Jackfruit" },
  { match: "rubber", label: "Rubber" },
  { match: "papaya", label: "Papaya" },
  { match: "hibiscus", label: "Hibiscus" },
  { match: "moringa", label: "Moringa" },
  { match: "pepper", label: "Pepper" },
  { match: "coffee", label: "Coffee" },
  { match: "tea", label: "Tea" },
];

export function plantMapLabel(plant: PlantListItem): string {
  const fromSpecies = SPECIES_LABEL[plant.species];
  if (fromSpecies) return fromSpecies;

  const lower = plant.name.toLowerCase();
  for (const { match, label } of NAME_KEYWORDS) {
    if (lower.includes(match)) return label;
  }

  const words = plant.name.replace(/[—–-]/g, " ").trim().split(/\s+/);
  if (words.length >= 2 && words[0].toLowerCase() === "curry") return "Curry Leaf";
  return words[0] ?? plant.name;
}
