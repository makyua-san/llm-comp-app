from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl
from typing import Dict, Any, Optional
import google.generativeai as genai
import os
from dotenv import load_dotenv
from backend.database.base import get_db
from backend.models import WebSource as WebSourceModel

load_dotenv()

router = APIRouter()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class UrlScrapeRequest(BaseModel):
    url: HttpUrl
    data_type: str  # 'pricing', 'benchmark', 'both'
    model_name: Optional[str] = None
    provider_name: Optional[str] = None

class ScrapeResult(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    extracted_info: Optional[Dict[str, Any]] = None

@router.post("/scrape-url", response_model=ScrapeResult)
async def scrape_url(request: UrlScrapeRequest, db: Session = Depends(get_db)):
    """Scrape pricing and benchmark data from a URL using Gemini API"""
    
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Construct prompt based on data type
        if request.data_type == 'pricing':
            prompt = f"""
            Analyze the content from this URL: {request.url}
            
            Extract pricing information for AI models. Look for:
            - Model names
            - Input token prices
            - Output token prices  
            - Request-based pricing
            - Price units (per 1K tokens, per million tokens, etc.)
            - Currency
            - Effective dates
            
            Focus on {request.model_name} from {request.provider_name} if specified.
            
            Return the information in JSON format with the following structure:
            {{
                "pricing_data": [
                    {{
                        "model_name": "string",
                        "provider": "string",
                        "price_type": "input_tokens|output_tokens|requests",
                        "price": "decimal",
                        "currency": "USD",
                        "unit": "per_1k_tokens|per_million_tokens|per_request",
                        "effective_date": "YYYY-MM-DD"
                    }}
                ]
            }}
            """
        elif request.data_type == 'benchmark':
            prompt = f"""
            Analyze the content from this URL: {request.url}
            
            Extract benchmark performance data for AI models. Look for:
            - Model names
            - Benchmark test names (MMLU, HellaSwag, TruthfulQA, etc.)
            - Scores/performance metrics
            - Units (accuracy, percentage, score)
            - Test dates
            
            Focus on {request.model_name} from {request.provider_name} if specified.
            
            Return the information in JSON format with the following structure:
            {{
                "benchmark_data": [
                    {{
                        "model_name": "string",
                        "provider": "string", 
                        "benchmark_name": "string",
                        "score": "decimal",
                        "unit": "accuracy|percentage|score",
                        "test_date": "YYYY-MM-DD"
                    }}
                ]
            }}
            """
        else:  # both
            prompt = f"""
            Analyze the content from this URL: {request.url}
            
            Extract both pricing and benchmark data for AI models.
            
            For pricing, look for:
            - Model names, input/output token prices, price units, currency, effective dates
            
            For benchmarks, look for:
            - Model names, benchmark test names, scores, units, test dates
            
            Focus on {request.model_name} from {request.provider_name} if specified.
            
            Return in JSON format with both pricing_data and benchmark_data arrays.
            """
        
        # Generate content using Gemini
        response = model.generate_content([
            {"text": prompt}
        ])
        
        # Store the URL as a web source
        existing_source = db.query(WebSourceModel).filter(WebSourceModel.url == str(request.url)).first()
        if not existing_source:
            web_source = WebSourceModel(
                url=str(request.url),
                source_type=request.data_type,
                is_active=True
            )
            db.add(web_source)
            db.commit()
        
        return ScrapeResult(
            success=True,
            data={"raw_response": response.text},
            extracted_info={
                "url": str(request.url),
                "data_type": request.data_type,
                "model_name": request.model_name,
                "provider_name": request.provider_name
            }
        )
        
    except Exception as e:
        return ScrapeResult(
            success=False,
            error=str(e)
        )

@router.get("/web-sources")
def get_web_sources(db: Session = Depends(get_db)):
    """Get all registered web sources"""
    sources = db.query(WebSourceModel).all()
    return sources

@router.post("/web-sources")
def add_web_source(url: str, source_type: str, db: Session = Depends(get_db)):
    """Add a new web source for scraping"""
    existing_source = db.query(WebSourceModel).filter(WebSourceModel.url == url).first()
    if existing_source:
        raise HTTPException(status_code=400, detail="Web source already exists")
    
    if source_type not in ['pricing', 'benchmark', 'both']:
        raise HTTPException(status_code=400, detail="Invalid source type")
    
    web_source = WebSourceModel(
        url=url,
        source_type=source_type,
        is_active=True
    )
    db.add(web_source)
    db.commit()
    db.refresh(web_source)
    return web_source

@router.delete("/web-sources/{source_id}")
def delete_web_source(source_id: int, db: Session = Depends(get_db)):
    """Delete a web source"""
    source = db.query(WebSourceModel).filter(WebSourceModel.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Web source not found")
    
    db.delete(source)
    db.commit()
    return {"message": "Web source deleted successfully"}