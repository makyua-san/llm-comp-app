from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from .provider import Provider

class ModelBase(BaseModel):
    name: str
    provider_id: int
    model_type: Optional[str] = None
    description: Optional[str] = None
    release_date: Optional[date] = None
    context_window: Optional[int] = None

class ModelCreate(ModelBase):
    pass

class ModelUpdate(BaseModel):
    name: Optional[str] = None
    provider_id: Optional[int] = None
    model_type: Optional[str] = None
    description: Optional[str] = None
    release_date: Optional[date] = None
    context_window: Optional[int] = None

class Model(ModelBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ModelWithDetails(Model):
    provider: Optional[Provider] = None
    benchmarks: List['BenchmarkBase'] = []
    pricing: List['PricingBase'] = []
    
    class Config:
        from_attributes = True