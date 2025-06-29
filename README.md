# LLM Comparison Tool

A comprehensive web application for comparing AI models, benchmarks, and pricing data. Built with Next.js frontend and FastAPI backend.

## Features

- 🤖 **Model Management**: Add and manage AI models from different providers
- 📊 **Benchmark Tracking**: Store and compare performance benchmarks across models
- 💰 **Pricing Analysis**: Track pricing data with historical periods
- 📋 **Custom Comparisons**: Create and save custom model comparison tables
- 🔍 **AI-Powered Scraping**: Extract data from websites using Gemini API
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Headless UI** for components
- **Recharts** for data visualization
- **Axios** for API communication

### Backend
- **FastAPI** with async/await support
- **SQLAlchemy** ORM with SQLite database
- **Pydantic** for data validation
- **Google Generative AI** for web scraping
- **CORS** middleware for frontend integration

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Gemini API key (for web scraping)

### Backend Setup

1. **Navigate to project directory**
   ```bash
   cd llm-comp
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

4. **Initialize database**
   ```bash
   python -c "from backend.database.init_db import create_tables, seed_data; create_tables(); seed_data()"
   ```

5. **Start FastAPI server**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Usage

### 1. View Models
- Browse all available AI models
- Filter by provider and model type
- Search by name or provider

### 2. Create Comparisons
- Select multiple models to compare
- View benchmarks and pricing side by side
- Save custom comparison tables

### 3. Add Data Manually
- Add new models, benchmarks, and pricing data
- Use intuitive forms with validation
- Auto-complete for common benchmark names

### 4. Scrape Data with AI
- Enter website URLs containing model data
- AI extracts pricing and benchmark information
- Review and save extracted data

## Project Structure

```
llm-comp/
├── src/                          # Frontend source
│   ├── app/                      # Next.js pages
│   ├── components/               # React components
│   ├── lib/                      # Utility libraries
│   └── types/                    # TypeScript types
├── backend/                      # Backend source
│   ├── api/routes/              # API endpoints
│   ├── database/                # Database setup
│   ├── models/                  # SQLAlchemy models
│   ├── schemas/                 # Pydantic schemas
│   └── services/                # Business logic
├── main.py                       # FastAPI application
├── package.json                  # Frontend dependencies
├── requirements.txt              # Backend dependencies
└── README.md                     # This file
```

## API Endpoints

### Models
- `GET /api/models` - List all models
- `POST /api/models` - Create new model
- `GET /api/models/{id}` - Get model details
- `PUT /api/models/{id}` - Update model
- `DELETE /api/models/{id}` - Delete model

### Benchmarks
- `GET /api/benchmarks` - List benchmarks
- `POST /api/benchmarks` - Add benchmark
- `GET /api/benchmarks/{id}` - Get benchmark

### Pricing
- `GET /api/pricing` - List pricing data
- `GET /api/pricing/current` - Get current pricing
- `POST /api/pricing` - Add pricing data

### Comparisons
- `GET /api/comparisons` - List comparison tables
- `POST /api/comparisons` - Create comparison
- `GET /api/comparisons/{id}` - Get comparison details

### Scraper
- `POST /api/scraper/scrape-url` - Scrape data from URL
- `GET /api/scraper/web-sources` - List saved sources

## Environment Variables

```env
# Database
DATABASE_URL=sqlite:///./llm_comp.db

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# FastAPI
API_SECRET_KEY=your-secret-key-here
API_ALGORITHM=HS256

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Development
ENVIRONMENT=development
```

## Development

### Adding New Features

1. **Backend**: Add models, schemas, and API routes
2. **Frontend**: Create components and pages
3. **Integration**: Update API client and types

### Database Schema

The application uses the following main entities:
- **Providers**: AI service providers (OpenAI, Google, etc.)
- **Models**: AI models with metadata
- **Benchmarks**: Performance test results
- **Pricing**: Cost information with validity periods
- **Comparisons**: Custom comparison tables
- **WebSources**: URLs for automated scraping

## Production Deployment

### Backend
1. Use PostgreSQL instead of SQLite
2. Set up proper environment variables
3. Configure CORS for production domain
4. Use gunicorn or similar WSGI server

### Frontend
1. Build for production: `npm run build`
2. Deploy static files to CDN
3. Configure API base URL for production

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open a GitHub issue or contact the development team.