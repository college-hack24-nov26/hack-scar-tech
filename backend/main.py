from fastapi import FastAPI

from routes.materials import router as materials_router

from routes.simulation import router as simulation_router

app = FastAPI(
    title="ThermoShelter AI",
    description="AI-Based Thermal Simulation and Shelter Optimization",
    version="1.0"
)

app.include_router(materials_router)
app.include_router(simulation_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to ThermoShelter AI"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "running",
        "project": "ThermoShelter AI",
        "version": "1.0"
    }