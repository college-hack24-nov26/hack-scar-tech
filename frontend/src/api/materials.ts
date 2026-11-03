export interface Material {
  id: number;
  name: string;
  thermal_conductivity: number;
  unit: string;
}

interface MaterialsResponse {
  materials: Material[];
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