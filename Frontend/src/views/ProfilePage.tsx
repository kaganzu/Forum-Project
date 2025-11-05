import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

type User = { id: number; userName: string; email?: string };

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          const res = await api.get<User>(`/api/User/${id}`);
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id]);

  if (!id) return <div>Provide a user id in the URL to view a profile.</div>;
  if (!user) return <div>Loading profile…</div>;

  return (
    <div className="space-y-6">
      <div className="card p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-brand-300" />
        <div>
          <div className="text-xl font-semibold">{user.userName}</div>
          <div className="text-sm text-neutral-500">{user.email}</div>
        </div>
      </div>
    </div>
  );
}


