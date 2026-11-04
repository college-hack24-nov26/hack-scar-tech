from fastapi import APIRouter
from fastapi import APIRouter, HTTPException
from schemas.material_layers import AssemblyInput
from services.material_calculator import calculate_u_value

router = APIRouter()

materials = [
    {
        "id": 1,
        "name": "Brick",
        "thermal_conductivity": 0.72,
        "unit": "W/mK"
    },
    {
        "id": 2,
        "name": "Wood",
        "thermal_conductivity": 0.12,
        "unit": "W/mK"
    },
    {
        "id": 3,
        "name": "Concrete",
        "thermal_conductivity": 1.7,
        "unit": "W/mK"
    },
    {
        "id": 4,
        "name": "Insulation",
        "thermal_conductivity": 0.04,
        "unit": "W/mK"
    }
]


@router.get("/api/materials")
def get_materials():
    return {
        "materials": materials
    }

@router.post("/api/materials/calculate-u-value")
def calculate_assembly_u_value(assembly: AssemblyInput):

    material_lookup = {
        material["id"]: material
        for material in materials
    }

    resolved_layers = []

    for layer in assembly.layers:

        material = material_lookup.get(layer.material_id)

        if material is None:
            raise HTTPException(
                status_code=404,
                detail=f"Material ID {layer.material_id} not found."
            )

        resolved_layers.append({
            "name": material["name"],
            "thermal_conductivity": material["thermal_conductivity"],
            "thickness_m": layer.thickness_m,
        })

    try:
        result = calculate_u_value(
            layers=resolved_layers,
            inside_surface_resistance=assembly.inside_surface_resistance,
            outside_surface_resistance=assembly.outside_surface_resistance,
        )

        return {
            "surface": assembly.surface,
            **result,
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))