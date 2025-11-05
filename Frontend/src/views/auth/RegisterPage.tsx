import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../state/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ token: string }>('/api/Auth/register', { username, email, password, confirmPassword });
      setToken(res.data.token);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-neutral-500">Join the community</p>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm">Username</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Confirm Password</label>
          <input className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        <div className="text-sm text-center text-neutral-600">
          Already have an account? <Link className="text-brand-700 hover:underline" to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}


