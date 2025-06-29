'use client';

import { useState, useEffect } from 'react';
import { modelsApi, providersApi } from '@/lib/api';
import type { ModelWithDetails, Provider } from '@/types';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';\nimport { ModelForm } from '@/components/forms';

export default function ModelsPage() {
  const [models, setModels] = useState<ModelWithDetails[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');\n  const [showModelForm, setShowModelForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedProvider, selectedType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelsResponse, providersResponse] = await Promise.all([
        modelsApi.getAll({
          provider_id: selectedProvider || undefined,
          model_type: selectedType || undefined,
        }),
        providersApi.getAll()
      ]);
      setModels(modelsResponse.data);
      setProviders(providersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-semibold text-gray-900">AI Models</h1>
          <p className="mt-2 text-sm text-gray-700">
            Compare AI models, their benchmarks, and pricing information.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowModelForm(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Model
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search models..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="input-field"
          value={selectedProvider || ''}
          onChange={(e) => setSelectedProvider(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Providers</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        
        <select
          className="input-field"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="text">Text</option>
          <option value="multimodal">Multimodal</option>
          <option value="image">Image</option>
        </select>
      </div>

      {/* Models Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <div key={model.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
                <p className="text-sm text-gray-600">{model.provider?.name}</p>
                
                <div className="mt-2 space-y-1">
                  {model.model_type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {model.model_type}
                    </span>
                  )}
                  
                  {model.context_window && (
                    <div className="text-sm text-gray-500">
                      Context: {model.context_window.toLocaleString()} tokens
                    </div>
                  )}
                </div>
                
                {model.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {model.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex space-x-2 text-xs text-gray-500">
                <span>{model.benchmarks?.length || 0} benchmarks</span>
                <span>•</span>
                <span>{model.pricing?.length || 0} pricing tiers</span>
              </div>
              
              <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => {/* TODO: Navigate to model details */}}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            No models found matching your criteria.
          </div>
        </div>
      )}
      
      {showModelForm && (
        <ModelForm
          onClose={() => setShowModelForm(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}