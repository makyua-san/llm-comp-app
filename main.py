from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.database.base import get_db
from backend.database.init_db import create_tables, seed_data
from backend.api.routes import providers, models, benchmarks, pricing, comparisons, gemini_scraper
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="LLM Comparison API",
    description="API for comparing AI models, benchmarks, and pricing",
    version="1.0.0"
)

# CORS middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add production origins here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(providers.router, prefix="/api/providers", tags=["providers"])
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(benchmarks.router, prefix="/api/benchmarks", tags=["benchmarks"])
app.include_router(pricing.router, prefix="/api/pricing", tags=["pricing"])
app.include_router(comparisons.router, prefix="/api/comparisons", tags=["comparisons"])
app.include_router(gemini_scraper.router, prefix="/api/scraper", tags=["scraper"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    create_tables()
    seed_data()

@app.get("/")
async def root():
    return {"message": "LLM Comparison API", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)