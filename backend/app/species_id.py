"""Species identification from a plant photo via the real Plant.id v3 API.

Confirmed against the official example (github.com/flowerchecker/plant-id-examples),
not from memory:
  POST https://api.plant.id/v3/identification
  headers: {"Api-Key": <key>}
  body: {"images": ["<base64>"]}
  response: result.is_plant.binary, result.classification.suggestions[].name (+ .probability)

Until PLANT_ID_API_KEY is set, `identify_species` returns None and callers
fall back to kc_table.UNKNOWN_SPECIES_PROFILE -- the `/api/plants` contract
shape doesn't change either way.
"""

import os

import requests

IDENTIFICATION_URL = "https://api.plant.id/v3/identification"


def identify_species(photo_base64: str) -> str | None:
    api_key = os.environ.get("PLANT_ID_API_KEY")
    if not api_key:
        return None

    response = requests.post(
        IDENTIFICATION_URL,
        headers={"Api-Key": api_key},
        json={"images": [photo_base64]},
        timeout=15,
    )
    response.raise_for_status()
    result = response.json()["result"]

    if not result["is_plant"]["binary"]:
        return None

    suggestions = result["classification"]["suggestions"]
    if not suggestions:
        return None

    return max(suggestions, key=lambda s: s["probability"])["name"]
