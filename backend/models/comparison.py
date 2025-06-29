from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database.base import Base

class ComparisonTable(Base):
    __tablename__ = "comparison_tables"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_by = Column(String(255))
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    items = relationship("ComparisonItem", back_populates="comparison_table", cascade="all, delete-orphan")

class ComparisonItem(Base):
    __tablename__ = "comparison_items"
    
    id = Column(Integer, primary_key=True, index=True)
    comparison_table_id = Column(Integer, ForeignKey("comparison_tables.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    comparison_table = relationship("ComparisonTable", back_populates="items")
    model = relationship("Model", back_populates="comparison_items")