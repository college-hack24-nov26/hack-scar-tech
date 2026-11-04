from typing import List


def calculate_u_value(
    layers: List[dict],
    inside_surface_resistance: float = 0.13,
    outside_surface_resistance: float = 0.04,
) -> dict:

    total_resistance = (
        inside_surface_resistance + outside_surface_resistance
    )

    layer_details = []

    for layer in layers:
        conductivity = layer["thermal_conductivity"]
        thickness = layer["thickness_m"]

        if conductivity <= 0 or thickness <= 0:
            raise ValueError("Conductivity and thickness must be positive.")

        resistance = thickness / conductivity
        total_resistance += resistance

        layer_details.append({
            "material": layer["name"],
            "thickness_m": thickness,
            "thermal_conductivity": conductivity,
            "thermal_resistance": round(resistance, 4),
        })

    u_value = 1 / total_resistance

    return {
        "u_value": round(u_value, 4),
        "total_thermal_resistance": round(total_resistance, 4),
        "layers": layer_details,
    }