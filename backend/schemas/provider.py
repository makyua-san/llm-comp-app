from pydantic import BaseModel, ConfigDict
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .model import ModelBase

class ProviderBase(BaseModel):
    name: str
    description: Optional[str] = None
    website_url: Optional[str] = None

class ProviderCreate(ProviderBase):
    pass

class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None

class Provider(ProviderBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class ProviderWithModels(Provider):
    models: List['ModelBase'] = []