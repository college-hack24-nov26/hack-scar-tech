import type { ShelterConfig } from '../types/shelter'

const API_BASE_URL = 'http://127.0.0.1:8000'

export interface ClimateInput {
location: string
outdoor_temperature_c: number
wind_speed_m_s: number
solar_radiation_w_m2: number
humidity_percent: number
}

export interface HeatLossResponse {
project: string
location: string
indoor_temperature_c: number
outdoor_temperature_c: number
surface_areas_m2: {
wall: number
roof: number
floor: number

}
thermal_analysis: {
wall_heat_loss_w: number
roof_heat_loss_w: number
floor_heat_loss_w: number
total_heat_loss_w: number
}
wind_speed_m_s: number
solar_radiation_w_m2: number
humidity_percent: number
}

export async function calculateHeatLoss(
shelter: ShelterConfig,
climate: ClimateInput
): Promise<HeatLossResponse> {
const response = await fetch(
`${API_BASE_URL}/api/simulation/heat-loss`,
{
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
shelter: {
...shelter,
orientation: shelter.orientation.toLowerCase() === 'n'
? 'north'
: shelter.orientation.toLowerCase() === 's'
? 'south'
: shelter.orientation.toLowerCase() === 'e'
? 'east'
: 'west',
},
climate,
}),
}
)

if (!response.ok) {
const error = await response.json().catch(() => null)
throw new Error(
error?.detail ?? `Simulation failed (${response.status})`
)
}

const result = await response.json()

return {
  ...result,
  wind_speed_m_s: climate.wind_speed_m_s,
  solar_radiation_w_m2: climate.solar_radiation_w_m2,
  humidity_percent: climate.humidity_percent,
} as HeatLossResponse
}
