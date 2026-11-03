from pydantic import BaseModel, Field


class ShelterInput(BaseModel):

    length_m: float = Field(gt=0)

    width_m: float = Field(gt=0)

    height_m: float = Field(gt=0)

    orientation: str = "south"

    wall_u_value: float = Field(gt=0)

    roof_u_value: float = Field(gt=0)

    floor_u_value: float = Field(gt=0)

    window_area_m2: float = Field(ge=0, default=0)

    door_area_m2: float = Field(ge=0, default=0)