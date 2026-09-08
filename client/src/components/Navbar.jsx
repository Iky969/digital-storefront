import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Plus, Wallet, History, Shield, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRupiah } from '../utils/api.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Store className="w-6 h-6 text-cyan-400" />
          <span>Digi<span className="text-cyan-400">Store</span></span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3" ref={ref}>
            <div className="flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 pl-3 pr-1 py-1">
              <span className="text-sm font-semibold text-emerald-400">{formatRupiah(user.balance)}</span>
              <Link
                to="/wallet"
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
                title="Top Up"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 hover:border-cyan-500"
              >
                <UserCircle className="w-6 h-6 text-zinc-300" />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-xl">
                  <div className="px-4 py-2 text-xs text-zinc-400 border-b border-zinc-700">
                    @{user.username}
                  </div>
                  <Link to="/wallet" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700">
                    <Wallet className="w-4 h-4" /> Wallet
                  </Link>
                  <Link to="/history" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700">
                    <History className="w-4 h-4" /> History
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700">
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-700"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-800">
              Login
            </Link>
            <Link to="/register" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
