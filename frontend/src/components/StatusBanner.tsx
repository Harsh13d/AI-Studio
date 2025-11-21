type StatusBannerProps = {
  status: 'info' | 'success' | 'error';
  message: string;
  attempts?: string;
};

const colors = {
  info: 'bg-slate-900/60 text-slate-200 border-slate-700',
  success: 'bg-emerald-900/40 text-emerald-200 border-emerald-600/40',
  error: 'bg-rose-900/30 text-rose-100 border-rose-500/40',
};

export const StatusBanner = ({ status, message, attempts }: StatusBannerProps) => (
  <div
    role={status === 'error' ? 'alert' : 'status'}
    className={`rounded-xl border px-4 py-3 text-sm ${colors[status]}`}
  >
    <p className="font-medium">{message}</p>
    {attempts && <p className="text-xs opacity-75">{attempts}</p>}
  </div>
);

