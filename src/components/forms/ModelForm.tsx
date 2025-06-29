'use client';

import { useState, useEffect } from 'react';
import { modelsApi, providersApi } from '@/lib/api';
import type { ModelCreateForm, Provider } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModelFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModelForm({ onClose, onSuccess }: ModelFormProps) {
  const [formData, setFormData] = useState<ModelCreateForm>({
    name: '',
    provider_id: 0,
    model_type: '',
    description: '',
    release_date: '',
    context_window: undefined
  });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await providersApi.getAll();
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await modelsApi.create({
        ...formData,
        context_window: formData.context_window || undefined
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail });
      } else {
        setErrors({ general: 'Failed to create model' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Model</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <div>
            <label className="label">Model Name *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="GPT-4o, Claude 3.5 Sonnet, etc."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Provider *</label>
            <select
              required
              className="input-field"
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: Number(e.target.value) })}
            >
              <option value="">Select a provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Model Type</label>
            <select
              className="input-field"
              value={formData.model_type}
              onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
            >
              <option value="">Select type</option>
              <option value="text">Text</option>
              <option value="multimodal">Multimodal</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Brief description of the model"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Release Date</label>
              <input
                type="date"
                className="input-field"
                value={formData.release_date}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Context Window (tokens)</label>
              <input
                type="number"
                className="input-field"
                placeholder="128000"
                value={formData.context_window || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  context_window: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>
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
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}