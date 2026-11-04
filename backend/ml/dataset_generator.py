import numpy as np
import pandas as pd
from pathlib import Path

# Reproducible dataset
np.random.seed(42)

SAMPLES = 20000

OUTPUT_DIR = Path(__file__).parent / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_dataset():

    data = []

    for _ in range(SAMPLES):

        # Shelter geometry
        length = np.random.uniform(3, 12)
        width = np.random.uniform(3, 10)
        height = np.random.uniform(2, 4)

        # Thermal properties
        wall_u = np.random.uniform(0.15, 2.5)
        roof_u = np.random.uniform(0.1, 2.5)
        floor_u = np.random.uniform(0.15, 2.5)

        # Openings
        total_wall_area = 2 * (length + width) * height

        window_area = np.random.uniform(
            0,
            min(12, total_wall_area * 0.25)
        )

        door_area = np.random.uniform(0, 3)

        # Ensure valid wall area
        if window_area + door_area >= total_wall_area:
            continue

        wall_area = total_wall_area - window_area - door_area

        roof_area = length * width
        floor_area = length * width

        # Climate
        outdoor_temp = np.random.uniform(-35, 15)

        indoor_temp = 20.0

        # Existing thermal engine formula
        delta_temp = indoor_temp - outdoor_temp

        wall_loss = wall_u * wall_area * delta_temp
        roof_loss = roof_u * roof_area * delta_temp
        floor_loss = floor_u * floor_area * delta_temp

        total_loss = wall_loss + roof_loss + floor_loss

        data.append({

            "length_m": length,
            "width_m": width,
            "height_m": height,

            "wall_u_value": wall_u,
            "roof_u_value": roof_u,
            "floor_u_value": floor_u,

            "window_area_m2": window_area,
            "door_area_m2": door_area,

            "outdoor_temperature_c": outdoor_temp,

            "wall_heat_loss_w": wall_loss,
            "roof_heat_loss_w": roof_loss,
            "floor_heat_loss_w": floor_loss,
            "total_heat_loss_w": total_loss

        })

    df = pd.DataFrame(data)

    output_file = OUTPUT_DIR / "thermal_dataset.csv"

    df.to_csv(output_file, index=False)

    print("Dataset generated successfully!")
    print(f"Samples: {len(df)}")
    print(f"Saved to: {output_file}")

    print("\nDataset preview:")
    print(df.head())

    print("\nDataset statistics:")
    print(df.describe())


if __name__ == "__main__":
    generate_dataset()