from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.base import get_db
from backend.models import Provider as ProviderModel
from backend.schemas import Provider, ProviderCreate, ProviderUpdate, ProviderWithModels

router = APIRouter()

@router.get("/", response_model=List[Provider])
def get_providers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all providers"""
    providers = db.query(ProviderModel).offset(skip).limit(limit).all()
    return providers

@router.get("/{provider_id}", response_model=ProviderWithModels)
def get_provider(provider_id: int, db: Session = Depends(get_db)):
    """Get a specific provider with their models"""
    provider = db.query(ProviderModel).filter(ProviderModel.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider

@router.post("/", response_model=Provider, status_code=status.HTTP_201_CREATED)
def create_provider(provider: ProviderCreate, db: Session = Depends(get_db)):
    """Create a new provider"""
    # Check if provider with same name already exists
    existing_provider = db.query(ProviderModel).filter(ProviderModel.name == provider.name).first()
    if existing_provider:
        raise HTTPException(status_code=400, detail="Provider with this name already exists")
    
    db_provider = ProviderModel(**provider.dict())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider

@router.put("/{provider_id}", response_model=Provider)
def update_provider(provider_id: int, provider: ProviderUpdate, db: Session = Depends(get_db)):
    """Update a provider"""
    db_provider = db.query(ProviderModel).filter(ProviderModel.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    update_data = provider.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_provider, field, value)
    
    db.commit()
    db.refresh(db_provider)
    return db_provider

@router.delete("/{provider_id}")
def delete_provider(provider_id: int, db: Session = Depends(get_db)):
    """Delete a provider"""
    db_provider = db.query(ProviderModel).filter(ProviderModel.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    db.delete(db_provider)
    db.commit()
    return {"message": "Provider deleted successfully"}