'use client';

import { useState, useEffect } from 'react';
import { benchmarksApi, modelsApi } from '@/lib/api';
import type { BenchmarkCreateForm, ModelWithDetails } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BenchmarkFormProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedModelId?: number;
}

export default function BenchmarkForm({ onClose, onSuccess, preselectedModelId }: BenchmarkFormProps) {
  const [formData, setFormData] = useState<BenchmarkCreateForm>({
    model_id: preselectedModelId || 0,
    benchmark_name: '',
    score: undefined,
    unit: '',
    test_date: '',
    source_url: '',
    notes: ''
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
      await benchmarksApi.create({
        ...formData,
        score: formData.score || undefined
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail });
      } else {
        setErrors({ general: 'Failed to create benchmark' });
      }
    } finally {
      setLoading(false);
    }
  };

  const commonBenchmarks = [
    'MMLU',
    'HellaSwag', 
    'TruthfulQA',
    'GSM8K',
    'HumanEval',
    'MATH',
    'BBH',
    'ARC-C',
    'WinoGrande',
    'DROP'
  ];

  const commonUnits = [
    'accuracy',
    'percentage',
    'score',
    'F1',
    'BLEU',
    'ROUGE-L',
    'pass@1'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Benchmark Data</h3>
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

          <div>
            <label className="label">Benchmark Name *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Select from list or enter custom"
              value={formData.benchmark_name}
              onChange={(e) => setFormData({ ...formData, benchmark_name: e.target.value })}
              list="common-benchmarks"
            />
            <datalist id="common-benchmarks">
              {commonBenchmarks.map(benchmark => (
                <option key={benchmark} value={benchmark} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Score</label>
              <input
                type="number"
                step="0.0001"
                className="input-field"
                placeholder="85.7"
                value={formData.score || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  score: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>

            <div>
              <label className="label">Unit</label>
              <input
                type="text"
                className="input-field"
                placeholder="accuracy, percentage, etc."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                list="common-units"
              />
              <datalist id="common-units">
                {commonUnits.map(unit => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="label">Test Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.test_date}
              onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
            />
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

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Additional notes about this benchmark result"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
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
              {loading ? 'Adding...' : 'Add Benchmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}