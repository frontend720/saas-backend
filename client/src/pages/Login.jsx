// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      login(data.data.accessToken, data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-4 h-4 bg-[#FF4500]"></div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] uppercase">Index</h1>
        </div>

        {/* Form */}
        <div className="border border-[#111111] bg-white p-8">
          <h2 className="text-xl font-bold text-[#111111] uppercase mb-1">Authenticate</h2>
          <p className="font-mono text-xs text-[#111111]/60 mb-8">ENTER CREDENTIALS TO ACCESS SYSTEM</p>

          {error && (
            <div className="border border-[#FF4500] bg-[#FF4500]/5 p-3 mb-6 font-mono text-xs text-[#FF4500]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
                placeholder="user@domain.com"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF4500] text-white font-bold uppercase text-sm tracking-wide hover:bg-[#111111] transition-colors border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Init_Session'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/register" className="font-mono text-xs text-[#111111]/60 hover:text-[#FF4500] transition-colors">
              NO ACCOUNT? → REGISTER_NEW_USER
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
