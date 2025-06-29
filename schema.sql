-- AI Model Comparison Database Schema

-- Providers table (推論環境提供者)
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Models table (AIモデル)
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    model_type VARCHAR(100), -- 'text', 'image', 'multimodal', etc.
    description TEXT,
    release_date DATE,
    context_window INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, provider_id)
);

-- Benchmarks table (ベンチマークデータ)
CREATE TABLE benchmarks (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES models(id),
    benchmark_name VARCHAR(255) NOT NULL,
    score DECIMAL(10,4),
    unit VARCHAR(50), -- 'accuracy', 'bleu', 'rouge', etc.
    test_date DATE,
    source_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing table (価格データ - 期間対応)
CREATE TABLE pricing (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES models(id),
    price_type VARCHAR(50) NOT NULL, -- 'input_tokens', 'output_tokens', 'requests', etc.
    price DECIMAL(12,6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    unit VARCHAR(50) NOT NULL, -- 'per_1k_tokens', 'per_million_tokens', etc.
    valid_from DATE NOT NULL,
    valid_to DATE,
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comparison tables (カスタム比較表)
CREATE TABLE comparison_tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comparison items (比較表に含まれるアイテム)
CREATE TABLE comparison_items (
    id SERIAL PRIMARY KEY,
    comparison_table_id INTEGER NOT NULL REFERENCES comparison_tables(id) ON DELETE CASCADE,
    model_id INTEGER NOT NULL REFERENCES models(id),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Web sources for automated data extraction
CREATE TABLE web_sources (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL UNIQUE,
    source_type VARCHAR(50) NOT NULL, -- 'pricing', 'benchmark', 'both'
    is_active BOOLEAN DEFAULT TRUE,
    last_scraped TIMESTAMP,
    scraping_interval_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_models_provider ON models(provider_id);
CREATE INDEX idx_benchmarks_model ON benchmarks(model_id);
CREATE INDEX idx_pricing_model ON pricing(model_id);
CREATE INDEX idx_pricing_dates ON pricing(valid_from, valid_to);
CREATE INDEX idx_comparison_items_table ON comparison_items(comparison_table_id);
CREATE INDEX idx_web_sources_active ON web_sources(is_active);

-- Sample data
INSERT INTO providers (name, description, website_url) VALUES 
('OpenAI', 'OpenAI API Platform', 'https://platform.openai.com'),
('Google Cloud', 'Google Cloud Vertex AI', 'https://cloud.google.com/vertex-ai'),
('Anthropic', 'Anthropic Claude API', 'https://www.anthropic.com'),
('AWS', 'Amazon Bedrock', 'https://aws.amazon.com/bedrock/'),
('Microsoft', 'Azure OpenAI Service', 'https://azure.microsoft.com/en-us/products/ai-services/openai-service/');

INSERT INTO models (name, provider_id, model_type, description, context_window) VALUES 
('GPT-4o', 1, 'multimodal', 'GPT-4 Omni model', 128000),
('GPT-4o-mini', 1, 'multimodal', 'GPT-4 Omni mini model', 128000),
('Claude 3.5 Sonnet', 3, 'text', 'Claude 3.5 Sonnet model', 200000),
('Claude 3.5 Haiku', 3, 'text', 'Claude 3.5 Haiku model', 200000),
('Gemini 1.5 Pro', 2, 'multimodal', 'Gemini 1.5 Pro model', 2000000),
('Gemini 1.5 Flash', 2, 'multimodal', 'Gemini 1.5 Flash model', 1000000);
