
export interface MLPredictionRequest {
  shelter: {
    length_m: number
    width_m: number
    height_m: number
    wall_u_value: number
    roof_u_value: number
    floor_u_value: number
    window_area_m2: number
    door_area_m2: number
  }
  climate: {
    location: string
    outdoor_temperature_c: number
    wind_speed_m_s: number
    solar_radiation_w_m2: number
    humidity_percent: number
  }
}

export interface MLPredictionResponse {
  model_name: string
  predictions: {
    wall_heat_loss_w: number
    roof_heat_loss_w: number
    floor_heat_loss_w: number
    total_heat_loss_w: number
  }
  input_features: Record<string, number>
  notice: string
}

const API_BASE_URL = 'http://127.0.0.1:8000'

export async function predictHeatLoss(
  data: MLPredictionRequest
): Promise<MLPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ml/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'ML prediction failed')
  }

  return response.json()
}

