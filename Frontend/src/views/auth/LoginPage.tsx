import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../state/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ token: string }>('/api/Auth/login', { usernameOrEmail, password });
      setToken(res.data.token);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-neutral-500">Sign in to your account</p>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm">Username or Email</label>
          <input className="input" value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        <div className="text-sm text-center text-neutral-600">
          Don’t have an account? <Link className="text-brand-700 hover:underline" to="/register">Sign up</Link>
        </div>
      </form>
    </div>
  );
}


