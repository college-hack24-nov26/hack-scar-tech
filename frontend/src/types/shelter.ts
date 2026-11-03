export interface ShelterConfig {
  length_m: number
  width_m: number
  height_m: number
  orientation: 'N' | 'S' | 'E' | 'W'
}

export const defaultShelterConfig: ShelterConfig = {
  length_m: 6,
  width_m: 4,
  height_m: 3,
  orientation: 'N',
}