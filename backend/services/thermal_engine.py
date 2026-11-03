def calculate_heat_loss(
    u_value: float,
    area: float,
    indoor_temp: float,
    outdoor_temp: float
):
    temperature_difference = indoor_temp - outdoor_temp

    heat_loss = (
        u_value * area * temperature_difference
    )

    return heat_loss


def calculate_total_heat_loss(
    wall_u,
    roof_u,
    floor_u,
    wall_area,
    roof_area,
    floor_area,
    indoor_temp,
    outdoor_temp
):
    wall_loss = calculate_heat_loss(
        wall_u, wall_area, indoor_temp, outdoor_temp
    )

    roof_loss = calculate_heat_loss(
        roof_u, roof_area, indoor_temp, outdoor_temp
    )

    floor_loss = calculate_heat_loss(
        floor_u, floor_area, indoor_temp, outdoor_temp
    )

    total_loss = wall_loss + roof_loss + floor_loss

    return {
        "wall_heat_loss_w": round(wall_loss, 2),
        "roof_heat_loss_w": round(roof_loss, 2),
        "floor_heat_loss_w": round(floor_loss, 2),
        "total_heat_loss_w": round(total_loss, 2)
    }