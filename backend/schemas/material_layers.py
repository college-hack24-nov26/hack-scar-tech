
from pydantic import BaseModel, Field
from typing import List, Literal


class MaterialLayer(BaseModel):
    material_id: int
    thickness_m: float = Field(gt=0, le=1)


class AssemblyInput(BaseModel):
    surface: Literal["wall", "roof", "floor"]

    layers: List[MaterialLayer] = Field(min_length=1)

    inside_surface_resistance: float = Field(gt=0, default=0.13)
    outside_surface_resistance: float = Field(gt=0, default=0.04)
