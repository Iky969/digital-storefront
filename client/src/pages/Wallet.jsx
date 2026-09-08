import { useState } from 'react';
import { Wallet as WalletIcon, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRupiah } from '../utils/api.js';
import DepositModal from '../components/DepositModal.jsx';

export default function Wallet() {
  const { user, applyUser, pushToast } = useAuth();
  const [show, setShow] = useState(false);

  if (!user) {
    return <div className="p-10 text-center text-zinc-400">Login dulu untuk mengakses wallet.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <WalletIcon className="w-4 h-4 text-cyan-400" /> Saldo E-Wallet
        </div>
        <p className="mt-2 text-4xl font-bold text-emerald-400">{formatRupiah(user.balance)}</p>
        <button
          onClick={() => setShow(true)}
          className="mt-4 flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" /> Top Up
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-500">
        Gateway pembayaran disimulasikan untuk keperluan demo.
      </p>

      {show && (
        <DepositModal
          onClose={() => setShow(false)}
          onSuccess={(nb) => {
            applyUser({ ...user, balance: nb });
            pushToast('Top up berhasil!', 'success');
          }}
        />
      )}
    </div>
  );
}
