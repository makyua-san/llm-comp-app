from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class BenchmarkBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    model_id: int
    benchmark_name: str
    score: Optional[Decimal] = None
    unit: Optional[str] = None
    test_date: Optional[date] = None
    source_url: Optional[str] = None
    notes: Optional[str] = None

class BenchmarkCreate(BenchmarkBase):
    pass
    
class BenchmarkUpdate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    model_id: Optional[int] = None
    benchmark_name: Optional[str] = None
    score: Optional[Decimal] = None
    unit: Optional[str] = None
    test_date: Optional[date] = None
    source_url: Optional[str] = None
    notes: Optional[str] = None

class Benchmark(BenchmarkBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None