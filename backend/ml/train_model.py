
import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    HistGradientBoostingRegressor
)
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.multioutput import MultiOutputRegressor


BASE_DIR = Path(__file__).parent
DATA_FILE = BASE_DIR / "data" / "thermal_dataset.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

TARGETS = [
    "wall_heat_loss_w",
    "roof_heat_loss_w",
    "floor_heat_loss_w",
    "total_heat_loss_w"
]


def prepare_features(df):

    X = df[[
        "length_m",
        "width_m",
        "height_m",
        "wall_u_value",
        "roof_u_value",
        "floor_u_value",
        "window_area_m2",
        "door_area_m2",
        "outdoor_temperature_c"
    ]].copy()

    X["wall_area_m2"] = (
        2 * (X["length_m"] + X["width_m"]) * X["height_m"]
        - X["window_area_m2"]
        - X["door_area_m2"]
    )

    X["roof_area_m2"] = X["length_m"] * X["width_m"]
    X["floor_area_m2"] = X["length_m"] * X["width_m"]

    X["temperature_difference_c"] = (
        20.0 - X["outdoor_temperature_c"]
    )

    return X


def train_models():

    print("Loading dataset...")

    df = pd.read_csv(DATA_FILE)

    X = prepare_features(df)
    y = df[TARGETS]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    algorithms = {
        "RandomForest": RandomForestRegressor(
            n_estimators=200,
            max_depth=22,
            min_samples_split=2,
            random_state=42,
            n_jobs=-1
        ),

        "ExtraTrees": ExtraTreesRegressor(
            n_estimators=200,
            max_depth=22,
            min_samples_split=2,
            random_state=42,
            n_jobs=-1
        ),

        "GradientBoosting": MultiOutputRegressor(
            HistGradientBoostingRegressor(
                max_iter=200,
                max_leaf_nodes=31,
                learning_rate=0.08,
                random_state=42
            )
        )
    }

    all_results = {}
    trained_models = {}

    for name, model in algorithms.items():

        print(f"\nTraining {name}...")

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        metrics = {}

        for index, target in enumerate(TARGETS):

            actual = y_test.iloc[:, index]
            predicted = predictions[:, index]

            mae = mean_absolute_error(actual, predicted)
            rmse = np.sqrt(mean_squared_error(actual, predicted))
            r2 = r2_score(actual, predicted)

            metrics[target] = {
                "MAE": round(mae, 3),
                "RMSE": round(rmse, 3),
                "R2": round(r2, 5)
            }

        all_results[name] = metrics
        trained_models[name] = model

        print(pd.DataFrame(metrics).T)

    # Select model based on total heat-loss MAE
    best_name = min(
        all_results,
        key=lambda name: all_results[name]["total_heat_loss_w"]["MAE"]
    )

    best_model = trained_models[best_name]

    bundle = {
        "model": best_model,
        "model_name": best_name,
        "features": list(X.columns),
        "targets": TARGETS,
        "evaluation": all_results
    }

    model_file = MODEL_DIR / "heat_loss_models.joblib"
    joblib.dump(bundle, model_file)

    print("\nBest model:", best_name)
    print("Saved model:", model_file)

    print("\nAll model evaluation results:")
    print(all_results)


if __name__ == "__main__":
    train_models()

