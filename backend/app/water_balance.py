"""The core simulation: moisture(t+1) = moisture(t) + rainfall(t) + irrigation(t) - ETc(t),
ETc(t) = ET0(t) * Kc(species), clipped to [wilting_point, field_capacity].

Pure functions, no DB/network -- unit-testable in isolation (see
tests/test_water_balance.py).

## Unit note (an explicit engineering choice, not in the brief's equation)

Open-Meteo gives ET0/rainfall as mm (a water depth). `moisture`,
`wilting_point`, and `field_capacity` are volumetric fractions (m3/m3, e.g.
0.15-0.45) per the API contract's example values. Converting a depth to a
fractional change requires dividing by a root-zone depth: a `d` mm change in
water depth over a root zone of `Zr` mm changes volumetric content by
`d / Zr`. FAO-56 itself works this same way (its root-zone depletion Dr is
tracked in mm, related to volumetric content via Zr) -- we just don't have
real per-species root-depth data (the FAO56 R package's Table 12 export has
Kc only, not Table 22's rooting depths), so this uses a single fixed
assumed depth for all species as a v1 simplification. Documenting this
plainly rather than fabricating per-species root depths, per the same
transparency standard as the Kc table.
"""

ASSUMED_ROOT_ZONE_MM = 300.0

# FAO-56's "readily available water" concept: irrigate once depletion passes
# a fraction `p` of total available water, not only at full wilting. p=0.5
# is FAO-56's commonly-cited default when crop-specific p isn't known (real
# values range ~0.3-0.7 by crop/ET demand) -- used here as a stand-in for
# per-species p until better data exists.
DEPLETION_FRACTION_P = 0.5


def compute_etc_mm(et0_mm: float, kc: float) -> float:
    return et0_mm * kc


def update_moisture(
    current_moisture: float,
    et0_mm: float,
    kc: float,
    rainfall_mm: float,
    wilting_point: float,
    field_capacity: float,
    irrigation_mm: float = 0.0,
    root_zone_mm: float = ASSUMED_ROOT_ZONE_MM,
) -> float:
    etc_mm = compute_etc_mm(et0_mm, kc)
    delta = (rainfall_mm + irrigation_mm - etc_mm) / root_zone_mm
    new_moisture = current_moisture + delta
    return max(wilting_point, min(field_capacity, new_moisture))


def needs_watering(
    moisture: float,
    wilting_point: float,
    field_capacity: float,
    p: float = DEPLETION_FRACTION_P,
) -> bool:
    threshold = field_capacity - p * (field_capacity - wilting_point)
    return moisture <= threshold


def apply_irrigation(
    current_moisture: float,
    wilting_point: float,
    field_capacity: float,
    typical_watering_liters: float,
    amount_liters: float,
) -> float:
    """Manual watering (POST /api/plants/{id}/water).

    We don't have real per-plant soil volume/pot area, so rather than invent
    one, this is calibrated directly off two numbers we already have: one
    "typical" watering (kc_table.typical_watering_liters) is defined to be
    enough to take a fully wilted plant to field capacity. Any other amount
    scales linearly from that.
    """
    fraction_per_liter = (field_capacity - wilting_point) / typical_watering_liters
    new_moisture = current_moisture + amount_liters * fraction_per_liter
    return min(field_capacity, new_moisture)
