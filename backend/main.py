from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.materials import router as materials_router
from routes.simulation import router as simulation_router
from routes.ml_prediction import router as ml_router

app = FastAPI(
title="ThermoShelter AI",
description="AI-Based Thermal Simulation and Shelter Optimization",
version="1.0"
)

app.add_middleware(
CORSMiddleware,
allow_origins=[
"http://localhost:5173",
"http://127.0.0.1:5173"
],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

app.include_router(materials_router)
app.include_router(simulation_router)
app.include_router(ml_router)
@app.get("/")
def home():
    return {"message": "Welcome to ThermoShelter AI"}

@app.get("/api/health")
def health_check():
    return {
    "status": "running",
    "project": "ThermoShelter AI",
    "version": "1.0"
    }
