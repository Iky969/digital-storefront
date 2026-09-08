import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { applyUser, pushToast } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { token, user } = await api('/auth/register', { method: 'POST', body: form });
      localStorage.setItem('token', token);
      applyUser(user);
      pushToast('Registrasi berhasil!', 'success');
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
          <UserPlus className="w-5 h-5 text-cyan-400" /> Register
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
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Password (min 6 karakter)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
        />
        <button
          disabled={busy}
          className="w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {busy ? 'Memproses...' : 'Register'}
        </button>
        <p className="text-center text-xs text-zinc-400">
          Sudah punya akun? <Link to="/login" className="text-cyan-400 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
