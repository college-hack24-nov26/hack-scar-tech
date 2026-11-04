
import joblib
import pandas as pd

from pathlib import Path

BASE_DIR = Path(__file__).parent

MODEL_FILE = BASE_DIR / "models" / "heat_loss_models.joblib"

bundle = joblib.load(MODEL_FILE)

model = bundle["model"]
features = bundle["features"]
targets = bundle["targets"]

shelter = {
    "length_m": 6.0,
    "width_m": 5.0,
    "height_m": 3.0,
    "wall_u_value": 0.5,
    "roof_u_value": 0.3,
    "floor_u_value": 0.4,
    "window_area_m2": 4.0,
    "door_area_m2": 2.0,
    "outdoor_temperature_c": -20.0
}

# Calculate derived features
wall_area = (
    2 * (shelter["length_m"] + shelter["width_m"])
    * shelter["height_m"]
    - shelter["window_area_m2"]
    - shelter["door_area_m2"]
)

roof_area = shelter["length_m"] * shelter["width_m"]
floor_area = roof_area

temperature_difference = (
    20.0 - shelter["outdoor_temperature_c"]
)

input_data = shelter.copy()

input_data.update({
    "wall_area_m2": wall_area,
    "roof_area_m2": roof_area,
    "floor_area_m2": floor_area,
    "temperature_difference_c": temperature_difference
})

X = pd.DataFrame(
    [[input_data[feature] for feature in features]],
    columns=features
)

# ML prediction
predictions = model.predict(X)[0]

# Original physics calculation
actual = {
    "wall_heat_loss_w":
        shelter["wall_u_value"] * wall_area * temperature_difference,

    "roof_heat_loss_w":
        shelter["roof_u_value"] * roof_area * temperature_difference,

    "floor_heat_loss_w":
        shelter["floor_u_value"] * floor_area * temperature_difference
}

actual["total_heat_loss_w"] = sum(actual.values())

print("\nTHERMOSHELTER AI - GRADIENT BOOSTING VALIDATION")
print("=" * 60)

for target, prediction in zip(targets, predictions):

    actual_value = actual[target]

    error = abs(actual_value - prediction)

    percentage_error = (
        error / abs(actual_value) * 100
        if actual_value != 0 else 0
    )

    print(f"\n{target}")
    print(f"Physics calculation : {actual_value:.2f} W")
    print(f"ML prediction       : {prediction:.2f} W")
    print(f"Absolute error      : {error:.2f} W")
    print(f"Percentage error    : {percentage_error:.2f}%")

component_sum = sum(
    predictions[targets.index(target)]
    for target in [
        "wall_heat_loss_w",
        "roof_heat_loss_w",
        "floor_heat_loss_w"
    ]
)

predicted_total = predictions[targets.index("total_heat_loss_w")]

print("\nCONSISTENCY CHECK")
print(f"Sum of predicted components: {component_sum:.2f} W")
print(f"Predicted total:              {predicted_total:.2f} W")
print(f"Difference:                   {abs(component_sum - predicted_total):.2f} W")

