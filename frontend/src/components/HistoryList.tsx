import type { Generation } from '../types';

type HistoryListProps = {
  items: Generation[];
  isLoading: boolean;
  error: string | null;
  onSelect: (generation: Generation) => void;
};

export const HistoryList = ({
  items,
  isLoading,
  error,
  onSelect,
}: HistoryListProps) => {
  return (
    <section aria-label="Recent generations" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Recent looks</h2>
        {isLoading && <span className="text-xs text-slate-400">Refreshing…</span>}
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.length === 0 && !isLoading ? (
          <p className="text-sm text-slate-400">
            Your last five generations will appear here.
          </p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-3 text-left transition hover:border-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <img
                src={item.imageUrl}
                alt={`Generated look for ${item.prompt}`}
                className="h-36 w-full rounded-xl object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-white">
                  {item.prompt}
                </p>
                <p className="text-xs uppercase tracking-wide text-brand-300">
                  {item.style}
                </p>
                <time
                  className="block text-xs text-slate-400"
                  dateTime={item.createdAt}
                >
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
};

