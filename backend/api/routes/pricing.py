from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from backend.database.base import get_db
from backend.models import Pricing as PricingModel, Model as ModelModel
from backend.schemas import Pricing, PricingCreate, PricingUpdate

router = APIRouter()

@router.get("/", response_model=List[Pricing])
def get_pricing(
    skip: int = 0,
    limit: int = 100,
    model_id: Optional[int] = Query(None, description="Filter by model ID"),
    price_type: Optional[str] = Query(None, description="Filter by price type"),
    valid_date: Optional[date] = Query(None, description="Filter by validity date"),
    db: Session = Depends(get_db)
):
    """Get all pricing with optional filtering"""
    query = db.query(PricingModel)
    
    if model_id:
        query = query.filter(PricingModel.model_id == model_id)
    if price_type:
        query = query.filter(PricingModel.price_type == price_type)
    if valid_date:
        query = query.filter(
            PricingModel.valid_from <= valid_date,
            (PricingModel.valid_to.is_(None)) | (PricingModel.valid_to >= valid_date)
        )
    
    pricing = query.offset(skip).limit(limit).all()
    return pricing

@router.get("/current", response_model=List[Pricing])
def get_current_pricing(
    model_id: Optional[int] = Query(None, description="Filter by model ID"),
    db: Session = Depends(get_db)
):
    """Get current pricing (valid today)"""
    today = date.today()
    query = db.query(PricingModel).filter(
        PricingModel.valid_from <= today,
        (PricingModel.valid_to.is_(None)) | (PricingModel.valid_to >= today)
    )
    
    if model_id:
        query = query.filter(PricingModel.model_id == model_id)
    
    return query.all()

@router.get("/{pricing_id}", response_model=Pricing)
def get_pricing_item(pricing_id: int, db: Session = Depends(get_db)):
    """Get a specific pricing item"""
    pricing = db.query(PricingModel).filter(PricingModel.id == pricing_id).first()
    if not pricing:
        raise HTTPException(status_code=404, detail="Pricing not found")
    return pricing

@router.post("/", response_model=Pricing, status_code=status.HTTP_201_CREATED)
def create_pricing(pricing: PricingCreate, db: Session = Depends(get_db)):
    """Create a new pricing item"""
    # Convert to dict
    pricing_data = pricing.dict()
    
    # Check if model exists
    model = db.query(ModelModel).filter(ModelModel.id == pricing_data['model_id']).first()
    if not model:
        raise HTTPException(status_code=400, detail="Model not found")
    
    db_pricing = PricingModel(**pricing_data)
    db.add(db_pricing)
    db.commit()
    db.refresh(db_pricing)
    return db_pricing

@router.put("/{pricing_id}", response_model=Pricing)
def update_pricing(pricing_id: int, pricing: PricingUpdate, db: Session = Depends(get_db)):
    """Update a pricing item"""
    db_pricing = db.query(PricingModel).filter(PricingModel.id == pricing_id).first()
    if not db_pricing:
        raise HTTPException(status_code=404, detail="Pricing not found")
    
    update_data = pricing.dict(exclude_unset=True)
    
    # Check if model exists if model_id is being updated
    if "model_id" in update_data:
        model = db.query(ModelModel).filter(ModelModel.id == update_data["model_id"]).first()
        if not model:
            raise HTTPException(status_code=400, detail="Model not found")
    
    for field, value in update_data.items():
        setattr(db_pricing, field, value)
    
    db.commit()
    db.refresh(db_pricing)
    return db_pricing

@router.delete("/{pricing_id}")
def delete_pricing(pricing_id: int, db: Session = Depends(get_db)):
    """Delete a pricing item"""
    db_pricing = db.query(PricingModel).filter(PricingModel.id == pricing_id).first()
    if not db_pricing:
        raise HTTPException(status_code=404, detail="Pricing not found")
    
    db.delete(db_pricing)
    db.commit()
    return {"message": "Pricing deleted successfully"}