"""Species identification from a plant photo.

Step 3 (per the build order) wires this up to the real Plant.id (kindwise)
API using PLANT_ID_API_KEY. Until that key exists, this stub returns no
species so callers fall back to kc_table.UNKNOWN_SPECIES_PROFILE -- the
`/api/plants` contract shape doesn't change, only the species/kc values
returned are placeholders until step 3.
"""

import os


def identify_species(photo_base64: str) -> str | None:
    if not os.environ.get("PLANT_ID_API_KEY"):
        return None

    raise NotImplementedError(
        "PLANT_ID_API_KEY is set but the real Plant.id integration (step 3) isn't wired up yet"
    )
