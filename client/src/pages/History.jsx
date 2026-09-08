import { useEffect, useState } from 'react';
import { Copy, Check, ShoppingBag, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { api, formatRupiah } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function History() {
  const { user, pushToast } = useAuth();
  const [tab, setTab] = useState('purchases');
  const [data, setData] = useState({ deposits: [], transactions: [] });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (user) api('/wallet/history').then(setData).catch(() => {});
  }, [user]);

  if (!user) return <div className="p-10 text-center text-zinc-400">Login dulu untuk melihat riwayat.</div>;

  const copy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Riwayat</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab('purchases')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'purchases' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Pembelian Saya
        </button>
        <button
          onClick={() => setTab('mutations')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'mutations' ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" /> Mutasi Saldo
        </button>
      </div>

      {tab === 'purchases' && (
        <div className="space-y-3">
          {data.transactions.length === 0 && (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-400">
              Belum ada pembelian.
            </p>
          )}
          {data.transactions.map((t) => (
            <div key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{t.product_name}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(t.created_at).toLocaleString('id-ID')}
                    {t.target_data ? ` • Target: ${t.target_data}` : ''}
                  </p>
                </div>
                <span className="font-semibold text-red-400">-{formatRupiah(t.price)}</span>
              </div>
              {t.delivered_content && t.delivered_content !== 'AUTO_FULFILLED' && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2">
                  <code className="text-xs text-emerald-400 break-all">{t.delivered_content}</code>
                  <button onClick={() => copy(t.id, t.delivered_content)} className="ml-2 text-zinc-400 hover:text-cyan-400">
                    {copiedId === t.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'mutations' && (
        <div className="space-y-2">
          {data.deposits.length === 0 && data.transactions.length === 0 && (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-400">
              Tidak ada mutasi saldo.
            </p>
          )}
          {[
            ...data.deposits.map((d) => ({
              id: `d${d.id}`,
              kind: 'in',
              label: `Top Up via ${d.payment_method}`,
              amount: d.amount,
              status: d.status,
              date: d.created_at,
            })),
            ...data.transactions.map((t) => ({
              id: `t${t.id}`,
              kind: 'out',
              label: t.product_name,
              amount: -t.price,
              status: t.status,
              date: t.created_at,
            })),
          ]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-center gap-3">
                  {m.kind === 'in' ? (
                    <ArrowDownCircle className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <ArrowUpCircle className="w-8 h-8 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(m.date).toLocaleString('id-ID')} • {m.status}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${m.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.amount >= 0 ? '+' : ''}
                  {formatRupiah(m.amount)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
