import { useEffect, useState } from 'react';
import { PackagePlus, Layers, CheckCircle2 } from 'lucide-react';
import { api, formatRupiah } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const TYPES = ['account_credentials', 'voucher_code', 'game_topup'];

export default function AdminDashboard() {
  const { user, pushToast } = useAuth();
  const [tab, setTab] = useState('product');
  const [cats, setCats] = useState([]);
  const [pending, setPending] = useState([]);

  // product form
  const [form, setForm] = useState({ category_id: '', name: '', description: '', price: '', type: 'account_credentials' });
  // stock form
  const [stockForm, setStockForm] = useState({ product_id: '', items: '' });
  // product list for stock dropdown
  const [products, setProducts] = useState([]);

  const loadAdminData = () => {
    if (user?.role !== 'admin') return;
    api('/products').then((d) => setProducts(d.products)).catch(() => {});
    api('/admin/deposits/pending').then((d) => setPending(d.deposits)).catch(() => {});
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;
    api('/products')
      .then((d) => {
        setCats([
          { id: 1, name: 'Game Topup' },
          { id: 2, name: 'Streaming Premium' },
          { id: 3, name: 'Voucher' },
        ]);
        setProducts(d.products);
      })
      .catch(() => {});
    loadAdminData();
  }, [user]);

  if (!user) return <div className="p-10 text-center text-zinc-400">Login dulu.</div>;
  if (user.role !== 'admin') return <div className="p-10 text-center text-red-400">Akses ditolak. Halaman khusus admin.</div>;

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/products', {
        method: 'POST',
        body: { ...form, category_id: Number(form.category_id), price: Number(form.price) },
      });
      pushToast('Produk berhasil ditambahkan', 'success');
      setForm({ category_id: '', name: '', description: '', price: '', type: 'account_credentials' });
      loadAdminData();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const submitStock = async (e) => {
    e.preventDefault();
    try {
      const res = await api('/admin/stock/bulk', {
        method: 'POST',
        body: { product_id: Number(stockForm.product_id), items: stockForm.items },
      });
      pushToast(`${res.inserted} stok ditambahkan`, 'success');
      setStockForm({ product_id: '', items: '' });
      loadAdminData();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const approve = async (id) => {
    try {
      await api('/admin/deposits/approve', { method: 'POST', body: { deposit_id: id } });
      pushToast('Deposit disetujui & saldo dikredit', 'success');
      loadAdminData();
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>

      <div className="mb-4 flex gap-2">
        {[
          ['product', 'Tambah Produk', <PackagePlus className="w-4 h-4" key="a" />],
          ['stock', 'Bulk Stok', <Layers className="w-4 h-4" key="b" />],
          ['deposits', `Approve Deposit (${pending.length})`, <CheckCircle2 className="w-4 h-4" key="c" />],
        ].map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              tab === key ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'product' && (
        <form onSubmit={submitProduct} className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm"
          >
            <option value="">Pilih Kategori</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            required
            placeholder="Nama produk"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm"
          />
          <textarea
            placeholder="Deskripsi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              placeholder="Harga (Rp)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button className="w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-zinc-950 hover:bg-cyan-400">
            Simpan Produk
          </button>
        </form>
      )}

      {tab === 'stock' && (
        <form onSubmit={submitStock} className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <select
            required
            value={stockForm.product_id}
            onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm"
          >
            <option value="">Pilih Produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <textarea
            required
            rows={6}
            placeholder={'Satu item per baris, contoh:\nemail:password\nVOUCHER-XXXX-YYYY'}
            value={stockForm.items}
            onChange={(e) => setStockForm({ ...stockForm, items: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-sm"
          />
          <button className="w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-zinc-950 hover:bg-cyan-400">
            Tambah Stok
          </button>
        </form>
      )}

      {tab === 'deposits' && (
        <div className="space-y-2">
          {pending.length === 0 && (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-400">
              Tidak ada deposit pending.
            </p>
          )}
          {pending.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div>
                <p className="font-semibold">{d.username} — {formatRupiah(d.amount)}</p>
                <p className="text-xs text-zinc-500">
                  {d.payment_method} • {d.payment_code} • {new Date(d.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => approve(d.id)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
