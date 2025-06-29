from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database.base import Base

class Model(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    model_type = Column(String(100))  # 'text', 'image', 'multimodal', etc.
    description = Column(Text)
    release_date = Column(Date)
    context_window = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    provider = relationship("Provider", back_populates="models")
    benchmarks = relationship("Benchmark", back_populates="model", cascade="all, delete-orphan")
    pricing = relationship("Pricing", back_populates="model", cascade="all, delete-orphan")
    comparison_items = relationship("ComparisonItem", back_populates="model")