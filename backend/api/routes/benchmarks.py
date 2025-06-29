from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.base import get_db
from backend.models import Benchmark as BenchmarkModel, Model as ModelModel
from backend.schemas import Benchmark, BenchmarkCreate, BenchmarkUpdate

router = APIRouter()

@router.get("/", response_model=List[Benchmark])
def get_benchmarks(
    skip: int = 0,
    limit: int = 100,
    model_id: Optional[int] = Query(None, description="Filter by model ID"),
    benchmark_name: Optional[str] = Query(None, description="Filter by benchmark name"),
    db: Session = Depends(get_db)
):
    """Get all benchmarks with optional filtering"""
    query = db.query(BenchmarkModel)
    
    if model_id:
        query = query.filter(BenchmarkModel.model_id == model_id)
    if benchmark_name:
        query = query.filter(BenchmarkModel.benchmark_name.contains(benchmark_name))
    
    benchmarks = query.offset(skip).limit(limit).all()
    return benchmarks

@router.get("/{benchmark_id}", response_model=Benchmark)
def get_benchmark(benchmark_id: int, db: Session = Depends(get_db)):
    """Get a specific benchmark"""
    benchmark = db.query(BenchmarkModel).filter(BenchmarkModel.id == benchmark_id).first()
    if not benchmark:
        raise HTTPException(status_code=404, detail="Benchmark not found")
    return benchmark

@router.post("/", response_model=Benchmark, status_code=status.HTTP_201_CREATED)
def create_benchmark(benchmark: BenchmarkCreate, db: Session = Depends(get_db)):
    """Create a new benchmark"""
    # Convert to dict
    benchmark_data = benchmark.dict()
    
    # Check if model exists
    model = db.query(ModelModel).filter(ModelModel.id == benchmark_data['model_id']).first()
    if not model:
        raise HTTPException(status_code=400, detail="Model not found")
    
    db_benchmark = BenchmarkModel(**benchmark_data)
    db.add(db_benchmark)
    db.commit()
    db.refresh(db_benchmark)
    return db_benchmark

@router.put("/{benchmark_id}", response_model=Benchmark)
def update_benchmark(benchmark_id: int, benchmark: BenchmarkUpdate, db: Session = Depends(get_db)):
    """Update a benchmark"""
    db_benchmark = db.query(BenchmarkModel).filter(BenchmarkModel.id == benchmark_id).first()
    if not db_benchmark:
        raise HTTPException(status_code=404, detail="Benchmark not found")
    
    update_data = benchmark.dict(exclude_unset=True)
    
    # Check if model exists if model_id is being updated
    if "model_id" in update_data:
        model = db.query(ModelModel).filter(ModelModel.id == update_data["model_id"]).first()
        if not model:
            raise HTTPException(status_code=400, detail="Model not found")
    
    for field, value in update_data.items():
        setattr(db_benchmark, field, value)
    
    db.commit()
    db.refresh(db_benchmark)
    return db_benchmark

@router.delete("/{benchmark_id}")
def delete_benchmark(benchmark_id: int, db: Session = Depends(get_db)):
    """Delete a benchmark"""
    db_benchmark = db.query(BenchmarkModel).filter(BenchmarkModel.id == benchmark_id).first()
    if not db_benchmark:
        raise HTTPException(status_code=404, detail="Benchmark not found")
    
    db.delete(db_benchmark)
    db.commit()
    return {"message": "Benchmark deleted successfully"}