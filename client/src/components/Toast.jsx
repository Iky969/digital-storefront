import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-cyan-400" />,
};

export default function Toast() {
  const { toasts } = useAuth();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 shadow-lg shadow-black/40"
        >
          {ICONS[t.type] || ICONS.info}
          <span className="text-sm text-zinc-100">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
