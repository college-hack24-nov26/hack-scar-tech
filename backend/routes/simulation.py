
from fastapi import APIRouter, HTTPException

from schemas.shelter import ShelterInput
from schemas.climate import ClimateInput

from services.thermal_engine import calculate_total_heat_loss

router = APIRouter(
    prefix="/api/simulation",
    tags=["Simulation"]
)


@router.post("/heat-loss")
def calculate_shelter_heat_loss(
    shelter: ShelterInput,
    climate: ClimateInput
):
    # Calculate surface areas
    wall_area = (
        2 * (shelter.length_m + shelter.width_m)
        * shelter.height_m
    )

    # Remove windows and doors from wall area
    wall_area -= (
        shelter.window_area_m2
        + shelter.door_area_m2
    )

    roof_area = shelter.length_m * shelter.width_m
    floor_area = shelter.length_m * shelter.width_m

    if wall_area <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid wall area. Check window and door dimensions."
        )

    # Calculate heat loss
    result = calculate_total_heat_loss(
        wall_u=shelter.wall_u_value,
        roof_u=shelter.roof_u_value,
        floor_u=shelter.floor_u_value,
        wall_area=wall_area,
        roof_area=roof_area,
        floor_area=floor_area,
        indoor_temp=20.0,
        outdoor_temp=climate.outdoor_temperature_c
    )

    return {
        "project": "ThermoShelter AI",
        "location": climate.location,
        "indoor_temperature_c": 20.0,
        "outdoor_temperature_c": climate.outdoor_temperature_c,
        "surface_areas_m2": {
            "wall": round(wall_area, 2),
            "roof": round(roof_area, 2),
            "floor": round(floor_area, 2)
        },
        "thermal_analysis": result
    }
