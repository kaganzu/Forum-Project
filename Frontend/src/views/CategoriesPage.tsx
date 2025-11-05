import { useEffect, useState } from 'react';
import { api } from '../api/client';

type Category = { id: number; name: string; description?: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Swagger: GET /api/Categories
        const res = await api.get<Category[]>('/api/Categories');
        setCategories(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map(c => (
        <div key={c.id} className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{c.name}</h3>
            <span className="text-xs text-brand-700">{c.id}</span>
          </div>
          {c.description && (
            <p className="mt-2 text-sm text-neutral-600">{c.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}


