import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Clapperboard, Ticket, Package, ShoppingCart } from 'lucide-react';
import { formatRupiah } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const ICONS = {
  Gamepad2: Gamepad2,
  Clapperboard: Clapperboard,
  Ticket: Ticket,
  Package: Package,
};

export default function ProductCard({ product }) {
  const Icon = ICONS[product.category_icon] || Package;
  const navigate = useNavigate();
  const { user } = useAuth();

  const goBuy = () => {
    if (!user) return navigate('/login');
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-cyan-500/60">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/10">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        {product.stock_count > 0 || product.type === 'game_topup' ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            Stok {product.type === 'game_topup' ? '∞' : product.stock_count}
          </span>
        ) : (
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">Habis</span>
        )}
      </div>
      <h3 className="font-semibold text-zinc-100">{product.name}</h3>
      <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{product.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-cyan-400">{formatRupiah(product.price)}</span>
        <button
          onClick={goBuy}
          disabled={product.stock_count === 0 && product.type !== 'game_topup'}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          <ShoppingCart className="w-4 h-4" /> Beli
        </button>
      </div>
    </div>
  );
}
