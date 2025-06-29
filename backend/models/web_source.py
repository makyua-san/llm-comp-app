from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from backend.database.base import Base

class WebSource(Base):
    __tablename__ = "web_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500), nullable=False, unique=True)
    source_type = Column(String(50), nullable=False)  # 'pricing', 'benchmark', 'both'
    is_active = Column(Boolean, default=True)
    last_scraped = Column(DateTime(timezone=True))
    scraping_interval_hours = Column(Integer, default=24)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())