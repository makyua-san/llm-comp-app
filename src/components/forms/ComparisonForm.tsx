'use client';

import { useState, useEffect } from 'react';
import { comparisonsApi, modelsApi } from '@/lib/api';
import type { ComparisonTableCreateForm, ModelWithDetails } from '@/types';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface ComparisonFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ComparisonForm({ onClose, onSuccess }: ComparisonFormProps) {
  const [formData, setFormData] = useState<ComparisonTableCreateForm>({
    name: '',
    description: '',
    model_ids: [],
    is_public: false
  });
  const [models, setModels] = useState<ModelWithDetails[]>([]);
  const [selectedModels, setSelectedModels] = useState<ModelWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setModelsLoading(true);
      const response = await modelsApi.getAll();
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setModelsLoading(false);
    }
  };

  const addModel = (model: ModelWithDetails) => {
    if (!selectedModels.find(m => m.id === model.id)) {
      const newSelectedModels = [...selectedModels, model];
      setSelectedModels(newSelectedModels);
      setFormData({
        ...formData,
        model_ids: newSelectedModels.map(m => m.id)
      });
    }
  };

  const removeModel = (modelId: number) => {
    const newSelectedModels = selectedModels.filter(m => m.id !== modelId);
    setSelectedModels(newSelectedModels);
    setFormData({
      ...formData,
      model_ids: newSelectedModels.map(m => m.id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.model_ids.length < 2) {
      setErrors({ models: 'Please select at least 2 models to compare' });
      setLoading(false);
      return;
    }

    try {
      await comparisonsApi.create(formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail });
      } else {
        setErrors({ general: 'Failed to create comparison' });
      }
    } finally {
      setLoading(false);
    }
  };

  const availableModels = models.filter(model => 
    !selectedModels.find(selected => selected.id === model.id)
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create Model Comparison</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <div>
            <label className="label">Comparison Name *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Top AI Models Q4 2024"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Brief description of this comparison"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              />
              <span className="ml-2 text-sm text-gray-700">Make this comparison public</span>
            </label>
          </div>

          {/* Selected Models */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Selected Models ({selectedModels.length})</label>
              {errors.models && (
                <span className="text-red-600 text-sm">{errors.models}</span>
              )}
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                  <div>
                    <span className="font-medium text-blue-900">{model.name}</span>
                    <span className="text-blue-700 text-sm ml-2">({model.provider?.name})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModel(model.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {selectedModels.length === 0 && (
                <div className="text-gray-500 text-sm py-4 text-center">
                  No models selected yet
                </div>
              )}
            </div>
          </div>

          {/* Available Models */}
          <div>
            <label className="label">Add Models</label>
            {modelsLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-3">
                {availableModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between hover:bg-gray-50 px-2 py-1 rounded">
                    <div>
                      <span className="font-medium">{model.name}</span>
                      <span className="text-gray-600 text-sm ml-2">({model.provider?.name})</span>
                      {model.model_type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                          {model.model_type}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => addModel(model)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {availableModels.length === 0 && (
                  <div className="text-gray-500 text-sm py-4 text-center">
                    {selectedModels.length === models.length 
                      ? 'All available models have been selected'
                      : 'No models available'
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedModels.length < 2}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Comparison'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}