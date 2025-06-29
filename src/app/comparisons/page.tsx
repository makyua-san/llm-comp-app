'use client';

import { useState, useEffect } from 'react';
import { comparisonsApi, modelsApi, benchmarksApi, pricingApi } from '@/lib/api';
import type { ComparisonTable, ModelWithDetails, Benchmark, Pricing } from '@/types';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ComparisonForm } from '@/components/forms';

export default function ComparisonsPage() {
  const [comparisons, setComparisons] = useState<ComparisonTable[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonTable | null>(null);
  const [comparisonModels, setComparisonModels] = useState<ModelWithDetails[]>([]);
  const [modelBenchmarks, setModelBenchmarks] = useState<Record<number, Benchmark[]>>({});
  const [modelPricing, setModelPricing] = useState<Record<number, Pricing[]>>({});
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showComparisonForm, setShowComparisonForm] = useState(false);

  useEffect(() => {
    fetchComparisons();
  }, []);

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const response = await comparisonsApi.getAll();
      setComparisons(response.data);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonDetails = async (comparison: ComparisonTable) => {
    try {
      setDetailsLoading(true);
      setSelectedComparison(comparison);
      
      // Get detailed comparison with items
      const detailResponse = await comparisonsApi.getById(comparison.id);
      const detailedComparison = detailResponse.data;
      
      if (detailedComparison.items && detailedComparison.items.length > 0) {
        // Fetch models for this comparison
        const modelPromises = detailedComparison.items.map(item => 
          modelsApi.getById(item.model_id)
        );
        const modelResponses = await Promise.all(modelPromises);
        const models = modelResponses.map(response => response.data);
        setComparisonModels(models);
        
        // Fetch benchmarks and pricing for each model
        const benchmarkPromises = models.map(model => 
          benchmarksApi.getAll({ model_id: model.id })
        );
        const pricingPromises = models.map(model => 
          pricingApi.getCurrent({ model_id: model.id })
        );
        
        const [benchmarkResponses, pricingResponses] = await Promise.all([
          Promise.all(benchmarkPromises),
          Promise.all(pricingPromises)
        ]);
        
        // Organize data by model ID
        const benchmarksByModel: Record<number, Benchmark[]> = {};
        const pricingByModel: Record<number, Pricing[]> = {};
        
        models.forEach((model, index) => {
          benchmarksByModel[model.id] = benchmarkResponses[index].data;
          pricingByModel[model.id] = pricingResponses[index].data;
        });
        
        setModelBenchmarks(benchmarksByModel);
        setModelPricing(pricingByModel);
      }
    } catch (error) {
      console.error('Error loading comparison details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const deleteComparison = async (id: number) => {
    if (confirm('Are you sure you want to delete this comparison?')) {
      try {
        await comparisonsApi.delete(id);
        setComparisons(comparisons.filter(c => c.id !== id));
        if (selectedComparison?.id === id) {
          setSelectedComparison(null);
          setComparisonModels([]);
        }
      } catch (error) {
        console.error('Error deleting comparison:', error);
      }
    }
  };

  // Get unique benchmark names across all models
  const allBenchmarkNames = Array.from(
    new Set(
      Object.values(modelBenchmarks)
        .flat()
        .map(b => b.benchmark_name)
    )
  ).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Model Comparisons</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and view custom model comparison tables.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowComparisonForm(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Comparison
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Comparison List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Saved Comparisons</h2>
          <div className="space-y-3">
            {comparisons.map((comparison) => (
              <div
                key={comparison.id}
                className={`card cursor-pointer transition-all ${
                  selectedComparison?.id === comparison.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => loadComparisonDetails(comparison)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{comparison.name}</h3>
                    {comparison.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {comparison.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{comparison.is_public ? 'Public' : 'Private'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(comparison.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        /* TODO: Edit comparison */
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteComparison(comparison.id);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {comparisons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No comparisons saved yet.
              </div>
            )}
          </div>
        </div>

        {/* Comparison Details */}
        <div className="lg:col-span-2">
          {selectedComparison ? (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedComparison.name}
              </h2>
              
              {detailsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="card overflow-x-auto">
                  {/* Model Header */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {comparisonModels.map((model) => (
                      <div key={model.id} className="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                        <p className="text-sm text-gray-600">{model.provider?.name}</p>
                        <div className="mt-2 space-y-1">
                          {model.model_type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {model.model_type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Benchmarks Section */}
                  {allBenchmarkNames.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Benchmarks</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Benchmark
                              </th>
                              {comparisonModels.map((model) => (
                                <th key={model.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {model.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allBenchmarkNames.map((benchmarkName) => (
                              <tr key={benchmarkName}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {benchmarkName}
                                </td>
                                {comparisonModels.map((model) => {
                                  const benchmark = modelBenchmarks[model.id]?.find(
                                    b => b.benchmark_name === benchmarkName
                                  );
                                  return (
                                    <td key={model.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {benchmark ? (
                                        <div>
                                          <span className="font-medium">{benchmark.score}</span>
                                          {benchmark.unit && (
                                            <span className="text-xs text-gray-400 ml-1">({benchmark.unit})</span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pricing Section */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Current Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {comparisonModels.map((model) => {
                        const pricing = modelPricing[model.id] || [];
                        return (
                          <div key={model.id} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{model.name}</h4>
                            <div className="space-y-2">
                              {pricing.map((price) => (
                                <div key={price.id} className="text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">{price.price_type}:</span>
                                    <span className="font-medium">
                                      ${price.price} {price.currency}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">{price.unit}</div>
                                </div>
                              ))}
                              {pricing.length === 0 && (
                                <div className="text-sm text-gray-400">No pricing data</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <EyeIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Select a comparison to view details</p>
            </div>
          )}
        </div>
      </div>
      
      {showComparisonForm && (
        <ComparisonForm
          onClose={() => setShowComparisonForm(false)}
          onSuccess={fetchComparisons}
        />
      )}
    </div>
  );
}