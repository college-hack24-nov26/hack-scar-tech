from fastapi import APIRouter

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