'use client';

import { useState, useEffect } from 'react';
import { scraperApi } from '@/lib/api';
import type { ScrapeRequest, ScrapeResult, WebSource } from '@/types';
import { 
  MagnifyingGlassIcon, 
  LinkIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function ScraperPage() {
  const [scrapeForm, setScrapeForm] = useState<ScrapeRequest>({
    url: '',
    data_type: 'both',
    model_name: '',
    provider_name: ''
  });
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [webSources, setWebSources] = useState<WebSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sourcesLoading, setSourcesLoading] = useState(true);

  useEffect(() => {
    fetchWebSources();
  }, []);

  const fetchWebSources = async () => {
    try {
      setSourcesLoading(true);
      const response = await scraperApi.getWebSources();
      setWebSources(response.data);
    } catch (error) {
      console.error('Error fetching web sources:', error);
    } finally {
      setSourcesLoading(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setScrapeResult(null);

    try {
      const response = await scraperApi.scrapeUrl(scrapeForm);
      setScrapeResult(response.data);
      
      // Refresh web sources list
      await fetchWebSources();
    } catch (error) {
      console.error('Error scraping URL:', error);
      setScrapeResult({
        success: false,
        error: 'Failed to scrape URL. Please check the URL and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWebSource = async (id: number) => {
    if (confirm('Are you sure you want to delete this web source?')) {
      try {
        await scraperApi.deleteWebSource(id);
        setWebSources(webSources.filter(source => source.id !== id));
      } catch (error) {
        console.error('Error deleting web source:', error);
      }
    }
  };

  const formatJsonOutput = (data: any) => {
    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Scraper</h1>
          <p className="mt-2 text-sm text-gray-700">
            Extract pricing and benchmark data from websites using AI.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scraping Form */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scrape New URL</h2>
          <form onSubmit={handleScrape} className="card space-y-4">
            <div>
              <label className="label">Website URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  required
                  className="input-field pl-10"
                  placeholder="https://example.com/pricing"
                  value={scrapeForm.url}
                  onChange={(e) => setScrapeForm({ ...scrapeForm, url: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Data Type</label>
              <select
                className="input-field"
                value={scrapeForm.data_type}
                onChange={(e) => setScrapeForm({ ...scrapeForm, data_type: e.target.value as 'pricing' | 'benchmark' | 'both' })}
              >
                <option value="both">Both Pricing & Benchmarks</option>
                <option value="pricing">Pricing Only</option>
                <option value="benchmark">Benchmarks Only</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Model Name (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="GPT-4, Claude-3, etc."
                  value={scrapeForm.model_name}
                  onChange={(e) => setScrapeForm({ ...scrapeForm, model_name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="label">Provider Name (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="OpenAI, Anthropic, etc."
                  value={scrapeForm.provider_name}
                  onChange={(e) => setScrapeForm({ ...scrapeForm, provider_name: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scraping...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="-ml-1 mr-2 h-5 w-5" />
                  Scrape Data
                </>
              )}
            </button>
          </form>

          {/* Scrape Results */}
          {scrapeResult && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Scraping Results</h3>
              <div className={`card ${scrapeResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start">
                  {scrapeResult.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    {scrapeResult.success ? (
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Successfully scraped data</h4>
                        {scrapeResult.data && (
                          <div className="mt-3">
                            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                              {formatJsonOutput(scrapeResult.data.raw_response)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Scraping failed</h4>
                        <p className="text-sm text-red-700 mt-1">{scrapeResult.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Web Sources */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Saved Web Sources</h2>
          
          {sourcesLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {webSources.map((source) => (
                <div key={source.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm truncate"
                        >
                          {source.url}
                        </a>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          source.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500">
                        Type: {source.source_type} • 
                        Added: {new Date(source.created_at).toLocaleDateString()}
                        {source.last_scraped && (
                          <> • Last scraped: {new Date(source.last_scraped).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteWebSource(source.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {webSources.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No web sources saved yet. Scrape a URL to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}