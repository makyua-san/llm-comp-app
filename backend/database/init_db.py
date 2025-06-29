from backend.database.base import Base, engine
from backend.models import Provider, Model, Benchmark, Pricing, ComparisonTable, ComparisonItem, WebSource
import datetime
from sqlalchemy.orm import Session
from backend.database.base import SessionLocal

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def seed_data():
    """Seed the database with initial data"""
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(Provider).first():
            print("Data already exists. Skipping seed.")
            return
        
        # Create providers
        providers_data = [
            {"name": "OpenAI", "description": "OpenAI API Platform", "website_url": "https://platform.openai.com"},
            {"name": "Google Cloud", "description": "Google Cloud Vertex AI", "website_url": "https://cloud.google.com/vertex-ai"},
            {"name": "Anthropic", "description": "Anthropic Claude API", "website_url": "https://www.anthropic.com"},
            {"name": "AWS", "description": "Amazon Bedrock", "website_url": "https://aws.amazon.com/bedrock/"},
            {"name": "Microsoft", "description": "Azure OpenAI Service", "website_url": "https://azure.microsoft.com/en-us/products/ai-services/openai-service/"}
        ]
        
        providers = []
        for provider_data in providers_data:
            provider = Provider(**provider_data)
            db.add(provider)
            providers.append(provider)
        
        db.commit()
        
        # Create models
        models_data = [
            {"name": "GPT-4o", "provider_id": 1, "model_type": "multimodal", "description": "GPT-4 Omni model", "context_window": 128000},
            {"name": "GPT-4o-mini", "provider_id": 1, "model_type": "multimodal", "description": "GPT-4 Omni mini model", "context_window": 128000},
            {"name": "Claude 3.5 Sonnet", "provider_id": 3, "model_type": "text", "description": "Claude 3.5 Sonnet model", "context_window": 200000},
            {"name": "Claude 3.5 Haiku", "provider_id": 3, "model_type": "text", "description": "Claude 3.5 Haiku model", "context_window": 200000},
            {"name": "Gemini 1.5 Pro", "provider_id": 2, "model_type": "multimodal", "description": "Gemini 1.5 Pro model", "context_window": 2000000},
            {"name": "Gemini 1.5 Flash", "provider_id": 2, "model_type": "multimodal", "description": "Gemini 1.5 Flash model", "context_window": 1000000}
        ]
        
        for model_data in models_data:
            model = Model(**model_data)
            db.add(model)
            
        db.commit()
        print("Sample data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    seed_data()