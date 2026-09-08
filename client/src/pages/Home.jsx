import { useEffect, useState } from 'react';
import { Zap, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../utils/api.js';
import ProductCard from '../components/ProductCard.jsx';

const CATS = [
  { slug: '', label: 'Semua' },
  { slug: 'game-topup', label: 'Game Topup' },
  { slug: 'streaming-premium', label: 'Streaming Premium' },
  { slug: 'voucher', label: 'Voucher' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api(`/products${active ? `?category=${active}` : ''}`)
      .then((d) => setProducts(d.products))
      .catch((e) => {
        console.error('Failed to load products:', e);
        setError(e.message || 'Gagal memuat produk');
      })
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 p-6 border border-zinc-800">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Top Up & Beli Produk Digital <span className="text-cyan-400">Instant</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-300">Akun premium, voucher, dan game topup — otomatis masuk dalam hitungan detik.</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-300">
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-cyan-400" /> Pengiriman instan</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% aman</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-400" /> Support 24/7</span>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => (
          <button
            key={c.slug}
            onClick={() => setActive(c.slug)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium ${
              active === c.slug
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {error && (
            <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
