import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../state/auth';

type Props = {
  onCreated?: () => void;
  onCancel?: () => void;
};

type Category = { id: number; name: string };

export default function NewPost({ onCreated, onCancel }: Props) {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get<Category[]>('/api/Categories');
        setCategories(res.data || []);
      } catch (e: any) {
        console.error('Failed to load categories:', e);
        setError(e?.response?.data?.message ?? 'Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (categoryId === '') {
      setError('Please select a category.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title,
        content,
        description: content,
        categoryIds: [Number(categoryId)]
      };
      // Swagger: POST /api/Post
      await api.post('/api/Post', payload);
      setTitle('');
      setContent('');
      setCategoryId('');
      onCreated?.();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card p-5">
        <div className="text-sm text-neutral-600">Log in to create a new post.</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-3">
      <div className="text-lg font-semibold">Create a Post</div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="space-y-1">
        <label className="text-sm">Title</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Content</label>
        <textarea className="input min-h-[120px]" value={content} onChange={e => setContent(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Category</label>
        <select
          className="input"
          required
          value={categoryId === '' ? '' : String(categoryId)}
          onChange={e => {
            const val = e.target.value;
            setCategoryId(val === '' ? '' : Number(val));
          }}
          disabled={loadingCategories}
        >
          <option value="">{loadingCategories ? 'Loading categories...' : 'Select category'}</option>
          {categories.map(c => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button className="btn btn-primary" disabled={loading || loadingCategories}>{loading ? 'Posting…' : 'Post'}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}


