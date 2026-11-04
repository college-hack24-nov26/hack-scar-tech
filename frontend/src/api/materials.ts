export interface Material {
  id: number;
  name: string;
  thermal_conductivity: number;
  unit: string;
}

interface MaterialsResponse {
  materials: Material[];
}

export interface MaterialLayer {
  material_id: number;
  thickness_m: number;
}

export interface AssemblyInput {
  surface: 'wall' | 'roof' | 'floor';
  layers: MaterialLayer[];
  inside_surface_resistance?: number;
  outside_surface_resistance?: number;
}

export interface UValueResponse {
  surface: string;
  u_value: number;
  total_thermal_resistance: number;
  layers: {
    material: string;
    thickness_m: number;
    thermal_conductivity: number;
    thermal_resistance: number;
  }[];
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getMaterials(): Promise<Material[]> {
  const response = await fetch(`${API_BASE_URL}/api/materials`);

  if (!response.ok) {
    throw new Error(`Failed to fetch materials (${response.status})`);
  }

  const data: MaterialsResponse = await response.json();

  return data.materials;
}

export async function calculateUValue(
  assembly: AssemblyInput
): Promise<UValueResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/materials/calculate-u-value`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assembly),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.detail || `U-value calculation failed (${response.status})`
    );
  }

  return response.json();
}