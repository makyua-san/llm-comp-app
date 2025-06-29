from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ComparisonTableBase(BaseModel):
    name: str
    description: Optional[str] = None
    created_by: Optional[str] = None
    is_public: bool = False

class ComparisonTableCreate(ComparisonTableBase):
    model_config = ConfigDict(protected_namespaces=())
    
    model_ids: List[int] = []  # List of model IDs to include

class ComparisonTableUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class ComparisonTable(ComparisonTableBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class ComparisonItemBase(BaseModel):
    comparison_table_id: int
    model_id: int
    display_order: int = 0

class ComparisonItemCreate(ComparisonItemBase):
    pass

class ComparisonItem(ComparisonItemBase):
    id: int
    created_at: datetime

class ComparisonTableWithItems(ComparisonTable):
    items: List[ComparisonItem] = []