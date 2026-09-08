import { useState } from 'react';
import { X, QrCode, Wallet, CheckCircle2 } from 'lucide-react';
import { api, formatRupiah } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const QUICK = [10000, 25000, 50000, 100000];
const METHODS = [
  { id: 'DANA', color: 'bg-sky-500' },
  { id: 'OVO', color: 'bg-purple-500' },
  { id: 'GoPay', color: 'bg-blue-500' },
  { id: 'QRIS', color: 'bg-emerald-500' },
];

export default function DepositModal({ onClose, onSuccess }) {
  const { pushToast } = useAuth();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(10000);
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState('DANA');
  const [deposit, setDeposit] = useState(null);
  const [busy, setBusy] = useState(false);

  const finalAmount = custom ? parseInt(custom, 10) || 0 : amount;

  const createDeposit = async () => {
    if (finalAmount < 1000) return pushToast('Minimal top up Rp 1.000', 'error');
    setBusy(true);
    try {
      const { deposit } = await api('/wallet/deposit', {
        method: 'POST',
        body: { amount: finalAmount, payment_method: method },
      });
      setDeposit(deposit);
      setStep(2);
    } catch (e) {
      pushToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeposit = async () => {
    setBusy(true);
    try {
      const res = await api('/wallet/deposit/confirm', {
        method: 'POST',
        body: { deposit_id: deposit.id },
      });
      pushToast(`Saldo bertambah ${formatRupiah(finalAmount)}`, 'success');
      onSuccess?.(res.new_balance);
      onClose();
    } catch (e) {
      pushToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Wallet className="w-5 h-5 text-cyan-400" /> Top Up Saldo
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div>
            <p className="mb-2 text-sm text-zinc-400">Pilih nominal cepat:</p>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setAmount(q);
                    setCustom('');
                  }}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold ${
                    !custom && amount === q
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {q / 1000}k
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Nominal custom (min 1000)"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />

            <p className="mb-2 text-sm text-zinc-400">Metode pembayaran:</p>
            <div className="mb-5 grid grid-cols-2 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                    method === m.id
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                  {m.id}
                </button>
              ))}
            </div>

            <button
              onClick={createDeposit}
              disabled={busy}
              className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {busy ? 'Memproses...' : `Bayar ${formatRupiah(finalAmount)}`}
            </button>
          </div>
        )}

        {step === 2 && deposit && (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-xl border border-zinc-700 bg-white p-2">
              <QrCode className="w-full h-full text-zinc-900" />
            </div>
            <p className="text-sm text-zinc-400">Nomor {deposit.payment_method}</p>
            <p className="mb-1 font-mono text-xl font-bold tracking-wider text-cyan-400">{deposit.payment_code}</p>
            <p className="mb-4 text-lg font-bold">{formatRupiah(deposit.amount)}</p>
            <button
              onClick={confirmDeposit}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {busy ? 'Memeriksa pembayaran...' : 'Simulasi Bayar / Confirm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
