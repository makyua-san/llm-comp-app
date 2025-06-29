from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database.base import Base

class Benchmark(Base):
    __tablename__ = "benchmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    benchmark_name = Column(String(255), nullable=False)
    score = Column(DECIMAL(10, 4))
    unit = Column(String(50))  # 'accuracy', 'bleu', 'rouge', etc.
    test_date = Column(Date)
    source_url = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    model = relationship("Model", back_populates="benchmarks")