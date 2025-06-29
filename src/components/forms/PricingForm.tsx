'use client';

import { useState, useEffect } from 'react';
import { pricingApi, modelsApi } from '@/lib/api';
import type { PricingCreateForm, ModelWithDetails } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PricingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedModelId?: number;
}

export default function PricingForm({ onClose, onSuccess, preselectedModelId }: PricingFormProps) {
  const [formData, setFormData] = useState<PricingCreateForm>({
    model_id: preselectedModelId || 0,
    price_type: '',
    price: 0,
    currency: 'USD',
    unit: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: '',
    source_url: ''
  });
  const [models, setModels] = useState<ModelWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await modelsApi.getAll();
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await pricingApi.create({
        ...formData,
        valid_to: formData.valid_to || undefined
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail });
      } else {
        setErrors({ general: 'Failed to create pricing' });
      }
    } finally {
      setLoading(false);
    }
  };

  const priceTypes = [
    'input_tokens',
    'output_tokens',
    'requests',
    'images',
    'audio_minutes',
    'video_minutes'
  ];

  const units = [
    'per_1k_tokens',
    'per_million_tokens',
    'per_request',
    'per_image',
    'per_minute',
    'per_hour'
  ];

  const currencies = [
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CNY'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Pricing Data</h3>
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
            <label className="label">Model *</label>
            <select
              required
              className="input-field"
              value={formData.model_id}
              onChange={(e) => setFormData({ ...formData, model_id: Number(e.target.value) })}
              disabled={!!preselectedModelId}
            >
              <option value="">Select a model</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Price Type *</label>
              <select
                required
                className="input-field"
                value={formData.price_type}
                onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
              >
                <option value="">Select price type</option>
                {priceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Unit *</label>
              <select
                required
                className="input-field"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="">Select unit</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Price *</label>
              <input
                type="number"
                step="0.000001"
                required
                className="input-field"
                placeholder="0.000002"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">Currency *</label>
              <select
                required
                className="input-field"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Valid From *</label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Valid To (Optional)</label>
              <input
                type="date"
                className="input-field"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Source URL</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://..."
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
            />
          </div>

          {/* Price Preview */}
          {formData.price > 0 && formData.unit && formData.currency && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-sm text-blue-800">
                <strong>Price Preview:</strong> {formData.currency} ${formData.price} {formData.unit.replace('_', ' ')}
              </div>
            </div>
          )}

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
              {loading ? 'Adding...' : 'Add Pricing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}