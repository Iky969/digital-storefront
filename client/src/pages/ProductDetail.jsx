import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Copy, Check, Wallet, ShoppingCart } from 'lucide-react';
import { api, formatRupiah } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import DepositModal from '../components/DepositModal.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, applyUser, pushToast } = useAuth();
  const [product, setProduct] = useState(null);
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showTopup, setShowTopup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    api(`/products/${id}`)
      .then((d) => {
        if (!cancelled) setProduct(d.product);
      })
      .catch(() => {
        if (!cancelled) navigate('/');
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (!product) return <div className="p-10 text-center text-zinc-400">Memuat...</div>;

  const isTopup = product.type === 'game_topup';
  const outOfStock = product.stock_count === 0 && !isTopup;
  const insufficient = user && user.balance < product.price;

  const buy = async () => {
    if (!user) return navigate('/login');
    if (isTopup && !target.trim()) return pushToast('Masukkan Game ID / User ID kamu', 'error');
    setBusy(true);
    try {
      const res = await api('/buy', { method: 'POST', body: { product_id: product.id, target_data: target || null } });
      applyUser({ ...user, balance: res.new_balance });
      setResult(res);
      pushToast('Pembelian sukses!', 'success');
    } catch (e) {
      pushToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.delivered_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <span className="text-xs font-medium uppercase tracking-wide text-cyan-400">{product.category_name}</span>
        <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
        <p className="mt-2 text-sm text-zinc-400">{product.description}</p>
        <p className="mt-4 text-3xl font-bold text-cyan-400">{formatRupiah(product.price)}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {outOfStock ? <span className="text-red-400">Stok habis</span> : `Stok tersedia: ${isTopup ? '∞ (auto)' : product.stock_count}`}
        </p>

        {isTopup && (
          <div className="mt-5">
            <label className="mb-1.5 block text-sm text-zinc-300">Game ID / User ID</label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Contoh: 12345678 (9012)"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {user && (
          <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-800/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Saldo kamu</span>
              <span className="font-semibold text-emerald-400">{formatRupiah(user.balance)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Setelah pembelian</span>
              <span className={insufficient ? 'font-semibold text-red-400' : 'font-semibold'}>
                {formatRupiah(user.balance - product.price)}
              </span>
            </div>
            {insufficient && (
              <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Saldo tidak cukup
                </div>
                <button
                  onClick={() => setShowTopup(true)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-cyan-500 py-2 text-xs font-bold text-zinc-950 hover:bg-cyan-400"
                >
                  <Wallet className="w-4 h-4" /> Top Up Saldo
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={buy}
          disabled={busy || outOfStock || (user && insufficient)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-bold text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          <ShoppingCart className="w-5 h-5" />
          {busy ? 'Memproses...' : outOfStock ? 'Stok Habis' : insufficient ? 'Saldo Tidak Cukup' : 'Beli Sekarang'}
        </button>
        {!user && (
          <p className="mt-3 text-center text-xs text-zinc-400">
            <Link to="/login" className="text-cyan-400 hover:underline">Login</Link> dulu untuk membeli
          </p>
        )}
      </div>

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-zinc-900 p-6 text-center">
            <h2 className="text-xl font-bold text-emerald-400">Pembelian Berhasil! 🎉</h2>
            <p className="mt-1 text-sm text-zinc-400">{product.name}</p>
            {result.delivered_content === 'AUTO_FULFILLED' ? (
              <p className="mt-4 rounded-lg bg-zinc-800 p-4 text-sm text-zinc-300">
                Topup sedang diproses ke <span className="font-bold text-cyan-400">{result.target_data || target}</span> dan akan masuk dalam 1-5 menit.
              </p>
            ) : (
              <>
                <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4 font-mono text-sm break-all">
                  {result.delivered_content}
                </div>
                <button
                  onClick={copy}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-zinc-950 hover:bg-cyan-400"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Tersalin!' : 'COPY TO CLIPBOARD'}
                </button>
              </>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate('/history')}
                className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm hover:bg-zinc-800"
              >
                Lihat Riwayat
              </button>
              <button onClick={() => setResult(null)} className="flex-1 rounded-lg bg-zinc-700 py-2.5 text-sm font-semibold hover:bg-zinc-600">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showTopup && (
        <DepositModal
          onClose={() => setShowTopup(false)}
          onSuccess={(nb) => applyUser({ ...user, balance: nb })}
        />
      )}
    </div>
  );
}
