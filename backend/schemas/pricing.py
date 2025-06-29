from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class PricingBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    model_id: int
    price_type: str  # 'input_tokens', 'output_tokens', 'requests', etc.
    price: Decimal
    currency: str = "USD"
    unit: str  # 'per_1k_tokens', 'per_million_tokens', etc.
    valid_from: date
    valid_to: Optional[date] = None
    source_url: Optional[str] = None

class PricingCreate(PricingBase):
    pass
    
class PricingUpdate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    model_id: Optional[int] = None
    price_type: Optional[str] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    unit: Optional[str] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    source_url: Optional[str] = None

class Pricing(PricingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None