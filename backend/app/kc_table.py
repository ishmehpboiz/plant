"""Species -> water-need parameter lookup, for the 15 most common
garden/farm trees & plants around Kanyakumari, Tamil Nadu (the brief's
deployment location).

## Kc sourcing (real data, not invented)

Primary source: the `FAO56` R package (cran.r-project.org/package=FAO56),
which packages the actual FAO-56 Irrigation and Drainage Paper No. 56,
Table 12 crop-coefficient tables. Installed locally and exported to CSV at
`backend/data/fao56_raw/*.csv` -- see that directory for the raw tables this
file is built from. Full source PDF: fao.org/4/x0490e/x0490e00.htm

Several of these 15 species have a direct FAO-56 entry (coconut/areca as
"Palm Trees", banana, rubber, tea, coffee, cassava). Others have no FAO-56
crop entry at all -- for those, we use the closest *structural* analog
(same growth form / canopy density), which is itself a documented FAO-56
practice (the paper explicitly says to use the conifer Kc for other
dense-canopy evergreen trees lacking specific data). Ornamentals/aromatics
with no reasonable analog (hibiscus, jasmine, curry leaf, moringa) are
tagged plainly as `category-estimate` -- a judgment call, not a sourced
number -- rather than forcing a fake FAO match.

Each entry's `kc` is FAO-56's Kc_mid (mid-season/peak-growth coefficient),
since these are all perennial plantings without a distinct annual harvest
cycle the way an FAO-56 annual crop has.

## wilting_point / field_capacity caveat

FAO-56 Table 12 does not provide these -- they're soil-water-holding
properties (a function of soil texture and root depth), not really a
"crop coefficient" the way Kc is. The values below are placeholder
estimates bucketed by rooting depth/type (deep-rooted tree vs.
shallow-rooted), pending real root-zone-depletion data. Don't read these
as FAO-56-sourced the way `kc` is -- `kc_source` only speaks to `kc`.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class SpeciesProfile:
    species: str  # scientific name, used as the lookup key
    common_name: str
    kc: float
    wilting_point: float
    field_capacity: float
    kc_source: str


KC_TABLE: dict[str, SpeciesProfile] = {
    "Cocos nucifera": SpeciesProfile(
        "Cocos nucifera", "Coconut", 1.00, 0.12, 0.42,
        "FAO-56 Table 12 (analog: Palm Trees, Kc_mid=1.00 -- coconut is a palm)",
    ),
    "Musa spp.": SpeciesProfile(
        "Musa spp.", "Banana", 1.20, 0.18, 0.48,
        "FAO-56 Table 12 (Banana, 2nd year, Kc_mid=1.20)",
    ),
    "Mangifera indica": SpeciesProfile(
        "Mangifera indica", "Mango", 0.85, 0.12, 0.42,
        "FAO-56 Table 12 (analog: Avocado, no ground cover, Kc_mid=0.85 -- "
        "closest evergreen-fruit-tree structural match; mango has no direct FAO-56 entry)",
    ),
    "Artocarpus heterophyllus": SpeciesProfile(
        "Artocarpus heterophyllus", "Jackfruit", 1.00, 0.12, 0.42,
        "FAO-56 Table 12 (analog: Conifer Trees, Kc_mid=1.00 -- FAO-56's own "
        "documented fallback for dense-canopy evergreen trees lacking specific data)",
    ),
    "Hevea brasiliensis": SpeciesProfile(
        "Hevea brasiliensis", "Rubber tree", 1.00, 0.12, 0.42,
        "FAO-56 Table 12 (Rubber Trees, Kc_mid=1.00)",
    ),
    "Camellia sinensis": SpeciesProfile(
        "Camellia sinensis", "Tea", 1.00, 0.15, 0.45,
        "FAO-56 Table 12 (Tea, non-shaded, Kc_mid=1.00)",
    ),
    "Coffea spp.": SpeciesProfile(
        "Coffea spp.", "Coffee", 0.95, 0.15, 0.45,
        "FAO-56 Table 12 (Coffee, bare ground cover, Kc_mid=0.95)",
    ),
    "Areca catechu": SpeciesProfile(
        "Areca catechu", "Areca nut / betel palm", 1.00, 0.12, 0.42,
        "FAO-56 Table 12 (analog: Palm Trees, Kc_mid=1.00 -- areca is a palm)",
    ),
    "Manihot esculenta": SpeciesProfile(
        "Manihot esculenta", "Tapioca / cassava", 1.10, 0.18, 0.48,
        "FAO-56 Table 12 (Cassava, year 2, Kc_mid=1.10)",
    ),
    "Piper nigrum": SpeciesProfile(
        "Piper nigrum", "Black pepper (vine)", 0.85, 0.18, 0.48,
        "FAO-56 Table 12 (analog: Grapes, Table/Raisin, Kc_mid=0.85 -- closest "
        "perennial-vine-on-support structural match; pepper has no direct FAO-56 entry)",
    ),
    "Carica papaya": SpeciesProfile(
        "Carica papaya", "Papaya", 0.75, 0.18, 0.48,
        "category-estimate (no reasonable FAO-56 analog identified; shallow-rooted, "
        "drought-sensitive -- judgment call, not sourced)",
    ),
    "Murraya koenigii": SpeciesProfile(
        "Murraya koenigii", "Curry leaf", 0.35, 0.10, 0.40,
        "category-estimate (no reasonable FAO-56 analog identified; hardy, "
        "drought-tolerant shrub -- judgment call, not sourced)",
    ),
    "Moringa oleifera": SpeciesProfile(
        "Moringa oleifera", "Drumstick / moringa", 0.35, 0.10, 0.40,
        "category-estimate (no reasonable FAO-56 analog identified; notably "
        "drought-tolerant -- judgment call, not sourced)",
    ),
    "Hibiscus rosa-sinensis": SpeciesProfile(
        "Hibiscus rosa-sinensis", "Hibiscus", 0.55, 0.15, 0.45,
        "category-estimate (no reasonable FAO-56 analog identified -- ornamental "
        "shrub, judgment call, not sourced)",
    ),
    "Jasminum sambac": SpeciesProfile(
        "Jasminum sambac", "Jasmine (malli)", 0.55, 0.15, 0.45,
        "category-estimate (no reasonable FAO-56 analog identified -- prefers "
        "consistent moisture for flower yield, judgment call, not sourced)",
    ),
}

# Used when species identification hasn't happened yet (Plant.id stub) or
# returns something not in the table.
UNKNOWN_SPECIES_PROFILE = SpeciesProfile(
    species="Unknown",
    common_name="Unknown",
    kc=0.65,
    wilting_point=0.15,
    field_capacity=0.45,
    kc_source="none -- species not yet identified, generic mid-range placeholder",
)


def lookup(species: str | None) -> SpeciesProfile:
    if species is None:
        return UNKNOWN_SPECIES_PROFILE
    return KC_TABLE.get(species, UNKNOWN_SPECIES_PROFILE)
