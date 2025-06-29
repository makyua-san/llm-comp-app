from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.base import get_db
from backend.models import Model as ModelModel, Provider as ProviderModel
from backend.schemas import Model, ModelCreate, ModelUpdate, ModelWithDetails

router = APIRouter()

@router.get("/", response_model=List[ModelWithDetails])
def get_models(
    skip: int = 0, 
    limit: int = 100, 
    provider_id: Optional[int] = Query(None, description="Filter by provider ID"),
    model_type: Optional[str] = Query(None, description="Filter by model type"),
    db: Session = Depends(get_db)
):
    """Get all models with optional filtering"""
    query = db.query(ModelModel)
    
    if provider_id:
        query = query.filter(ModelModel.provider_id == provider_id)
    if model_type:
        query = query.filter(ModelModel.model_type == model_type)
    
    models = query.offset(skip).limit(limit).all()
    return models

@router.get("/{model_id}", response_model=ModelWithDetails)
def get_model(model_id: int, db: Session = Depends(get_db)):
    """Get a specific model with details"""
    model = db.query(ModelModel).filter(ModelModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model

@router.post("/", response_model=Model, status_code=status.HTTP_201_CREATED)
def create_model(model: ModelCreate, db: Session = Depends(get_db)):
    """Create a new model"""
    # Check if provider exists
    provider = db.query(ProviderModel).filter(ProviderModel.id == model.provider_id).first()
    if not provider:
        raise HTTPException(status_code=400, detail="Provider not found")
    
    # Check if model with same name and provider already exists
    existing_model = db.query(ModelModel).filter(
        ModelModel.name == model.name,
        ModelModel.provider_id == model.provider_id
    ).first()
    if existing_model:
        raise HTTPException(status_code=400, detail="Model with this name already exists for this provider")
    
    # Convert to dict and map fields
    model_data = model.dict()
    
    db_model = ModelModel(**model_data)
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

@router.put("/{model_id}", response_model=Model)
def update_model(model_id: int, model: ModelUpdate, db: Session = Depends(get_db)):
    """Update a model"""
    db_model = db.query(ModelModel).filter(ModelModel.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    update_data = model.dict(exclude_unset=True)
    
    # Check if provider exists if provider_id is being updated
    if "provider_id" in update_data:
        provider = db.query(ProviderModel).filter(ProviderModel.id == update_data["provider_id"]).first()
        if not provider:
            raise HTTPException(status_code=400, detail="Provider not found")
    
    for field, value in update_data.items():
        setattr(db_model, field, value)
    
    db.commit()
    db.refresh(db_model)
    return db_model

@router.delete("/{model_id}")
def delete_model(model_id: int, db: Session = Depends(get_db)):
    """Delete a model"""
    db_model = db.query(ModelModel).filter(ModelModel.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    db.delete(db_model)
    db.commit()
    return {"message": "Model deleted successfully"}