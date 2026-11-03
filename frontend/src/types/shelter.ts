export interface ShelterConfig {
length_m: number
width_m: number
height_m: number
orientation: 'N' | 'S' | 'E' | 'W'

wall_u_value: number
roof_u_value: number
floor_u_value: number

window_area_m2: number
door_area_m2: number
}

export const defaultShelterConfig: ShelterConfig = {
length_m: 6,
width_m: 4,
height_m: 3,
orientation: 'N',

wall_u_value: 0.8,
roof_u_value: 0.5,
floor_u_value: 0.6,

window_area_m2: 4,
door_area_m2: 2,
}
