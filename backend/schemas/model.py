from pydantic import BaseModel, ConfigDict
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

# Runtime imports for forward reference resolution
from .benchmark import BenchmarkBase  # noqa: E402, F401
from .pricing import PricingBase  # noqa: E402, F401

class ModelBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    name: str
    provider_id: int
    model_type: Optional[str] = None
    description: Optional[str] = None
    release_date: Optional[date] = None
    context_window: Optional[int] = None

class ModelCreate(ModelBase):
    pass

class ModelUpdate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
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

class ModelWithDetails(Model):
    provider: Optional['Provider'] = None
    benchmarks: List['BenchmarkBase'] = []
    pricing: List['PricingBase'] = []