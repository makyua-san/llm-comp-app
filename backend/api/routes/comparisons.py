from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.base import get_db
from backend.models import (
    ComparisonTable as ComparisonTableModel,
    ComparisonItem as ComparisonItemModel,
    Model as ModelModel
)
from backend.schemas import (
    ComparisonTable,
    ComparisonTableCreate,
    ComparisonTableUpdate,
    ComparisonTableWithItems,
    ComparisonItem,
    ComparisonItemCreate
)

router = APIRouter()

@router.get("/", response_model=List[ComparisonTable])
def get_comparison_tables(
    skip: int = 0,
    limit: int = 100,
    is_public: bool = None,
    db: Session = Depends(get_db)
):
    """Get all comparison tables"""
    query = db.query(ComparisonTableModel)
    
    if is_public is not None:
        query = query.filter(ComparisonTableModel.is_public == is_public)
    
    tables = query.offset(skip).limit(limit).all()
    return tables

@router.get("/{table_id}", response_model=ComparisonTableWithItems)
def get_comparison_table(table_id: int, db: Session = Depends(get_db)):
    """Get a specific comparison table with items"""
    table = db.query(ComparisonTableModel).filter(ComparisonTableModel.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Comparison table not found")
    return table

@router.post("/", response_model=ComparisonTable, status_code=status.HTTP_201_CREATED)
def create_comparison_table(table: ComparisonTableCreate, db: Session = Depends(get_db)):
    """Create a new comparison table"""
    # Extract model_ids from the request
    model_ids = table.model_ids
    table_data = table.dict(exclude={"model_ids"})
    
    # Create the comparison table
    db_table = ComparisonTableModel(**table_data)
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    
    # Add comparison items
    for order, model_id in enumerate(model_ids):
        # Check if model exists
        model = db.query(ModelModel).filter(ModelModel.id == model_id).first()
        if not model:
            # Clean up the created table if a model doesn't exist
            db.delete(db_table)
            db.commit()
            raise HTTPException(status_code=400, detail=f"Model with id {model_id} not found")
        
        comparison_item = ComparisonItemModel(
            comparison_table_id=db_table.id,
            model_id=model_id,
            display_order=order
        )
        db.add(comparison_item)
    
    db.commit()
    db.refresh(db_table)
    return db_table

@router.put("/{table_id}", response_model=ComparisonTable)
def update_comparison_table(table_id: int, table: ComparisonTableUpdate, db: Session = Depends(get_db)):
    """Update a comparison table"""
    db_table = db.query(ComparisonTableModel).filter(ComparisonTableModel.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Comparison table not found")
    
    update_data = table.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_table, field, value)
    
    db.commit()
    db.refresh(db_table)
    return db_table

@router.delete("/{table_id}")
def delete_comparison_table(table_id: int, db: Session = Depends(get_db)):
    """Delete a comparison table"""
    db_table = db.query(ComparisonTableModel).filter(ComparisonTableModel.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Comparison table not found")
    
    db.delete(db_table)
    db.commit()
    return {"message": "Comparison table deleted successfully"}

@router.post("/{table_id}/items", response_model=ComparisonItem, status_code=status.HTTP_201_CREATED)
def add_comparison_item(table_id: int, item: ComparisonItemCreate, db: Session = Depends(get_db)):
    """Add an item to a comparison table"""
    # Check if table exists
    table = db.query(ComparisonTableModel).filter(ComparisonTableModel.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Comparison table not found")
    
    # Check if model exists
    model = db.query(ModelModel).filter(ModelModel.id == item.model_id).first()
    if not model:
        raise HTTPException(status_code=400, detail="Model not found")
    
    # Check if item already exists
    existing_item = db.query(ComparisonItemModel).filter(
        ComparisonItemModel.comparison_table_id == table_id,
        ComparisonItemModel.model_id == item.model_id
    ).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Model already in comparison table")
    
    # Override the table_id to ensure consistency
    item.comparison_table_id = table_id
    db_item = ComparisonItemModel(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{table_id}/items/{item_id}")
def remove_comparison_item(table_id: int, item_id: int, db: Session = Depends(get_db)):
    """Remove an item from a comparison table"""
    db_item = db.query(ComparisonItemModel).filter(
        ComparisonItemModel.id == item_id,
        ComparisonItemModel.comparison_table_id == table_id
    ).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Comparison item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Comparison item removed successfully"}