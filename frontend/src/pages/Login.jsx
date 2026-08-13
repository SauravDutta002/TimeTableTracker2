import { useState } from 'react';
import { API_BASE_URL } from '../config';
import { HiOutlineAcademicCap } from 'react-icons/hi2';

export default function Login({ onLoginSuccess }) {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid.trim() || !password.trim()) return;

    setLoading(true);
    setError('');
    setStatus('Connecting securely...');

    try {
      await new Promise((r) => setTimeout(r, 300));
      setStatus('Authenticating & syncing...');

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: uid.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed');
      }

      setStatus('Loading dashboard...');
      await new Promise((r) => setTimeout(r, 200));

      onLoginSuccess(result.token, result.data, uid.trim(), password);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 h-full min-h-[50vh] animate-fade-up w-full">
      <div className="relative w-full max-w-[320px] rounded-[32px] overflow-hidden p-8 shadow-sm ring-1 ring-emerald-900/5">
        {/* The beautiful Ghibli background with frosted glass overlay */}
        <div className="absolute inset-0 bg-[url('/ghibli-bg.jpg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xl"></div>
        
        <div className="relative z-10 flex flex-col">
          <p className="mb-8 text-[13px] text-center text-emerald-950/80 leading-relaxed px-2 font-bold mt-2">
            Ready to see your latest attendance and marks?
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              id="uid"
              type="text"
              placeholder="University ID"
              value={uid}
              onChange={(e) => {
                setUid(e.target.value);
                setError('');
              }}
              disabled={loading}
              autoComplete="username"
              className="w-full rounded-[20px] bg-white/50 px-4 py-3.5 text-sm font-semibold text-emerald-950 placeholder-emerald-950/40 outline-none transition-all focus:bg-white/70 focus:ring-2 focus:ring-emerald-900/10 shadow-sm backdrop-blur-sm"
            />

            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              disabled={loading}
              autoComplete="current-password"
              className="w-full rounded-[20px] bg-white/50 px-4 py-3.5 text-sm font-semibold text-emerald-950 placeholder-emerald-950/40 outline-none transition-all focus:bg-white/70 focus:ring-2 focus:ring-emerald-900/10 shadow-sm backdrop-blur-sm"
            />

            {error && <p className="text-[11px] text-rose-500 text-center font-bold mt-1 bg-white/50 py-2 rounded-xl backdrop-blur-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-[20px] bg-emerald-700/80 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          {status && (
            <p className="mt-6 text-[11px] text-center text-emerald-950/70 animate-pulse font-bold tracking-wide uppercase">
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
