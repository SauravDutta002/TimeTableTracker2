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
    <div className="flex flex-col items-center justify-center p-4 h-full min-h-[50vh] animate-fade-up">
      <div className="w-full max-w-[300px] rounded-[32px] bg-gradient-to-b from-white/80 to-white/40 p-8 ring-1 ring-emerald-900/10 shadow-lg backdrop-blur-xl">
        
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-emerald-900/5 flex items-center justify-center ring-1 ring-emerald-900/10">
            <HiOutlineAcademicCap className="w-7 h-7 text-emerald-900" />
          </div>
        </div>

        <h2 className="mb-1.5 text-[22px] font-serif font-bold text-center text-emerald-950">Welcome Back</h2>
        <p className="mb-6 text-xs text-center text-emerald-950/60 leading-relaxed px-2">
          Sign in to securely sync your academic data.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            className="w-full rounded-[18px] bg-white/60 px-4 py-3 text-xs font-medium text-emerald-950 placeholder-emerald-950/40 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-900/10 shadow-sm"
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
            className="w-full rounded-[18px] bg-white/60 px-4 py-3 text-xs font-medium text-emerald-950 placeholder-emerald-950/40 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-900/10 shadow-sm"
          />

          {error && <p className="text-[10px] text-rose-500 text-center font-bold mt-1 bg-rose-500/10 py-1.5 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-[18px] bg-emerald-900 px-4 py-3 text-xs font-bold tracking-wide text-white shadow-md hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        {status && (
          <p className="mt-5 text-[10px] text-center text-emerald-950/50 animate-pulse font-bold tracking-wide uppercase">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
