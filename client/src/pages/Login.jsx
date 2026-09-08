import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { applyUser, pushToast } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: form });
      localStorage.setItem('token', token);
      applyUser(user);
      pushToast(`Selamat datang, ${user.username}!`, 'success');
      navigate('/');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <LogIn className="w-5 h-5 text-cyan-400" /> Login
        </h1>
        <input
          required
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
        />
        <button
          disabled={busy}
          className="w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {busy ? 'Memproses...' : 'Login'}
        </button>
        <p className="text-center text-xs text-zinc-400">
          Belum punya akun? <Link to="/register" className="text-cyan-400 hover:underline">Register</Link>
        </p>
        <div className="rounded-lg bg-zinc-800/60 p-3 text-xs text-zinc-400">
          <p className="font-semibold text-zinc-300">Akun demo:</p>
          <p>admin / admin123 (saldo 1jt)</p>
          <p>user / user123 (saldo 50rb)</p>
        </div>
      </form>
    </div>
  );
}
