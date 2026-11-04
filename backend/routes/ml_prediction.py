from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.ml_prediction import predict_heat_loss

router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"],
)


class MLPredictionRequest(BaseModel):
    shelter: dict
    climate: dict


@router.post("/predict")
def predict(request: MLPredictionRequest):
    try:
        return predict_heat_loss(
            request.shelter,
            request.climate,
        )
    except (KeyError, ValueError) as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"ML prediction failed: {str(error)}",
        )

