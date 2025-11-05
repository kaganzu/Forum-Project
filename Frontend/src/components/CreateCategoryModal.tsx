import { FormEvent, useState } from 'react';
import { api } from '../api/client';

type Props = {
  onClose: () => void;
  onCreated?: () => void;
};

export default function CreateCategoryModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/Categories', { name, description });
      setName('');
      setDescription('');
      onCreated?.();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Create Category</h2>
          <button
            className="text-neutral-400 hover:text-neutral-700 transition"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700">Name</label>
            <input
              className="w-full mt-1 rounded-lg border border-neutral-300 px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                         text-neutral-900 bg-white transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Description</label>
            <textarea
              className="w-full mt-1 rounded-lg border border-neutral-300 px-3 py-2 min-h-[80px] 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                         text-neutral-900 bg-white transition"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-semibold transition"
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg py-2 font-medium transition"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
