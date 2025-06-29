import axios from 'axios';
import type {
  Provider,
  Model,
  ModelWithDetails,
  Benchmark,
  Pricing,
  ComparisonTable,
  ComparisonTableCreateForm,
  ScrapeRequest,
  ScrapeResult,
  WebSource,
  ProviderCreateForm,
  ModelCreateForm,
  BenchmarkCreateForm,
  PricingCreateForm
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Providers API
export const providersApi = {
  getAll: () => api.get<Provider[]>('/api/providers'),
  getById: (id: number) => api.get<Provider>(`/api/providers/${id}`),
  create: (data: ProviderCreateForm) => api.post<Provider>('/api/providers', data),
  update: (id: number, data: Partial<ProviderCreateForm>) => api.put<Provider>(`/api/providers/${id}`, data),
  delete: (id: number) => api.delete(`/api/providers/${id}`),
};

// Models API
export const modelsApi = {
  getAll: (params?: { provider_id?: number; model_type?: string; skip?: number; limit?: number }) => 
    api.get<ModelWithDetails[]>('/api/models', { params }),
  getById: (id: number) => api.get<ModelWithDetails>(`/api/models/${id}`),
  create: (data: ModelCreateForm) => api.post<Model>('/api/models', data),
  update: (id: number, data: Partial<ModelCreateForm>) => api.put<Model>(`/api/models/${id}`, data),
  delete: (id: number) => api.delete(`/api/models/${id}`),
};

// Benchmarks API
export const benchmarksApi = {
  getAll: (params?: { model_id?: number; benchmark_name?: string; skip?: number; limit?: number }) => 
    api.get<Benchmark[]>('/api/benchmarks', { params }),
  getById: (id: number) => api.get<Benchmark>(`/api/benchmarks/${id}`),
  create: (data: BenchmarkCreateForm) => api.post<Benchmark>('/api/benchmarks', data),
  update: (id: number, data: Partial<BenchmarkCreateForm>) => api.put<Benchmark>(`/api/benchmarks/${id}`, data),
  delete: (id: number) => api.delete(`/api/benchmarks/${id}`),
};

// Pricing API
export const pricingApi = {
  getAll: (params?: { model_id?: number; price_type?: string; valid_date?: string; skip?: number; limit?: number }) => 
    api.get<Pricing[]>('/api/pricing', { params }),
  getCurrent: (params?: { model_id?: number }) => 
    api.get<Pricing[]>('/api/pricing/current', { params }),
  getById: (id: number) => api.get<Pricing>(`/api/pricing/${id}`),
  create: (data: PricingCreateForm) => api.post<Pricing>('/api/pricing', data),
  update: (id: number, data: Partial<PricingCreateForm>) => api.put<Pricing>(`/api/pricing/${id}`, data),
  delete: (id: number) => api.delete(`/api/pricing/${id}`),
};

// Comparisons API
export const comparisonsApi = {
  getAll: (params?: { is_public?: boolean; skip?: number; limit?: number }) => 
    api.get<ComparisonTable[]>('/api/comparisons', { params }),
  getById: (id: number) => api.get<ComparisonTable>(`/api/comparisons/${id}`),
  create: (data: ComparisonTableCreateForm) => api.post<ComparisonTable>('/api/comparisons', data),
  update: (id: number, data: Partial<Omit<ComparisonTableCreateForm, 'model_ids'>>) => 
    api.put<ComparisonTable>(`/api/comparisons/${id}`, data),
  delete: (id: number) => api.delete(`/api/comparisons/${id}`),
  addItem: (tableId: number, modelId: number, displayOrder?: number) => 
    api.post(`/api/comparisons/${tableId}/items`, {
      comparison_table_id: tableId,
      model_id: modelId,
      display_order: displayOrder || 0
    }),
  removeItem: (tableId: number, itemId: number) => 
    api.delete(`/api/comparisons/${tableId}/items/${itemId}`),
};

// Scraper API
export const scraperApi = {
  scrapeUrl: (data: ScrapeRequest) => api.post<ScrapeResult>('/api/scraper/scrape-url', data),
  getWebSources: () => api.get<WebSource[]>('/api/scraper/web-sources'),
  addWebSource: (url: string, source_type: string) => 
    api.post<WebSource>('/api/scraper/web-sources', { url, source_type }),
  deleteWebSource: (id: number) => api.delete(`/api/scraper/web-sources/${id}`),
};

export default api;