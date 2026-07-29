import pytest

from app.water_balance import apply_irrigation, needs_watering, update_moisture

WP = 0.15  # wilting point
FC = 0.45  # field capacity


def test_dry_hot_day_decreases_moisture():
    new_moisture = update_moisture(
        current_moisture=0.40, et0_mm=6.0, kc=0.75, rainfall_mm=0.0,
        wilting_point=WP, field_capacity=FC,
    )
    assert new_moisture < 0.40


def test_heavy_rain_increases_moisture():
    new_moisture = update_moisture(
        current_moisture=0.20, et0_mm=1.0, kc=0.5, rainfall_mm=50.0,
        wilting_point=WP, field_capacity=FC,
    )
    assert new_moisture > 0.20


def test_moisture_clips_at_field_capacity():
    new_moisture = update_moisture(
        current_moisture=0.44, et0_mm=0.0, kc=0.5, rainfall_mm=200.0,
        wilting_point=WP, field_capacity=FC,
    )
    assert new_moisture == FC


def test_moisture_clips_at_wilting_point():
    new_moisture = update_moisture(
        current_moisture=0.16, et0_mm=20.0, kc=1.0, rainfall_mm=0.0,
        wilting_point=WP, field_capacity=FC,
    )
    assert new_moisture == WP


def test_irrigation_offsets_et_loss():
    without_irrigation = update_moisture(
        current_moisture=0.30, et0_mm=5.0, kc=0.8, rainfall_mm=0.0,
        wilting_point=WP, field_capacity=FC,
    )
    with_irrigation = update_moisture(
        current_moisture=0.30, et0_mm=5.0, kc=0.8, rainfall_mm=0.0,
        wilting_point=WP, field_capacity=FC, irrigation_mm=10.0,
    )
    assert with_irrigation > without_irrigation


def test_needs_watering_true_below_depletion_threshold():
    # threshold = FC - 0.5*(FC-WP) = 0.30
    assert needs_watering(0.25, WP, FC) is True


def test_needs_watering_false_above_depletion_threshold():
    assert needs_watering(0.35, WP, FC) is False


def test_needs_watering_at_field_capacity_is_false():
    assert needs_watering(FC, WP, FC) is False


def test_typical_watering_brings_wilted_plant_to_field_capacity():
    # by definition of typical_watering_liters
    new_moisture = apply_irrigation(
        current_moisture=WP, wilting_point=WP, field_capacity=FC,
        typical_watering_liters=5.0, amount_liters=5.0,
    )
    assert new_moisture == FC


def test_partial_watering_scales_linearly():
    new_moisture = apply_irrigation(
        current_moisture=0.20, wilting_point=WP, field_capacity=FC,
        typical_watering_liters=5.0, amount_liters=2.0,
    )
    assert new_moisture == pytest.approx(0.32)


def test_overwatering_clips_at_field_capacity():
    new_moisture = apply_irrigation(
        current_moisture=0.40, wilting_point=WP, field_capacity=FC,
        typical_watering_liters=5.0, amount_liters=20.0,
    )
    assert new_moisture == FC
