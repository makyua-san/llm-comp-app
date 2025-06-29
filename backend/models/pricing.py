from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database.base import Base

class Pricing(Base):
    __tablename__ = "pricing"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    price_type = Column(String(50), nullable=False)  # 'input_tokens', 'output_tokens', 'requests', etc.
    price = Column(DECIMAL(12, 6), nullable=False)
    currency = Column(String(3), default="USD")
    unit = Column(String(50), nullable=False)  # 'per_1k_tokens', 'per_million_tokens', etc.
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date)
    source_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    model = relationship("Model", back_populates="pricing")