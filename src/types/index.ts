export interface Provider {
  id: number;
  name: string;
  description?: string;
  website_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Model {
  id: number;
  name: string;
  provider_id: number;
  model_type?: string;
  description?: string;
  release_date?: string;
  context_window?: number;
  created_at: string;
  updated_at?: string;
  provider?: Provider;
}

export interface Benchmark {
  id: number;
  model_id: number;
  benchmark_name: string;
  score?: number;
  unit?: string;
  test_date?: string;
  source_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  model?: Model;
}

export interface Pricing {
  id: number;
  model_id: number;
  price_type: string;
  price: number;
  currency: string;
  unit: string;
  valid_from: string;
  valid_to?: string;
  source_url?: string;
  created_at: string;
  updated_at?: string;
  model?: Model;
}

export interface ComparisonTable {
  id: number;
  name: string;
  description?: string;
  created_by?: string;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  items?: ComparisonItem[];
}

export interface ComparisonItem {
  id: number;
  comparison_table_id: number;
  model_id: number;
  display_order: number;
  created_at: string;
  model?: Model;
}

export interface ModelWithDetails extends Model {
  benchmarks: Benchmark[];
  pricing: Pricing[];
}

export interface ScrapeRequest {
  url: string;
  data_type: 'pricing' | 'benchmark' | 'both';
  model_name?: string;
  provider_name?: string;
}

export interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  extracted_info?: any;
}

export interface WebSource {
  id: number;
  url: string;
  source_type: string;
  is_active: boolean;
  last_scraped?: string;
  scraping_interval_hours: number;
  created_at: string;
  updated_at: string;
}

// Form types
export interface ProviderCreateForm {
  name: string;
  description?: string;
  website_url?: string;
}

export interface ModelCreateForm {
  name: string;
  provider_id: number;
  model_type?: string;
  description?: string;
  release_date?: string;
  context_window?: number;
}

export interface BenchmarkCreateForm {
  model_id: number;
  benchmark_name: string;
  score?: number;
  unit?: string;
  test_date?: string;
  source_url?: string;
  notes?: string;
}

export interface PricingCreateForm {
  model_id: number;
  price_type: string;
  price: number;
  currency: string;
  unit: string;
  valid_from: string;
  valid_to?: string;
  source_url?: string;
}

export interface ComparisonTableCreateForm {
  name: string;
  description?: string;
  model_ids: number[];
  is_public: boolean;
}