from pydantic import BaseModel, Field


class ClimateInput(BaseModel):

    location: str

    outdoor_temperature_c: float

    wind_speed_m_s: float = Field(ge=0)

    solar_radiation_w_m2: float = Field(ge=0)

    humidity_percent: float = Field(
        ge=0,
        le=100,
        default=50
    )