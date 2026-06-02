import { Loader2, AlertTriangle, FlaskConical } from 'lucide-react';

export function LoadingState({ label = 'Loading intelligence…', rows = 4 }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2 text-sm text-ink-400">
        <Loader2 size={16} className="animate-spin" />
        {label}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-ink-100/70" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-ink-100/60" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="gov-card-pad max-w-lg mx-auto mt-10 text-center">
      <div className="grid place-items-center h-12 w-12 mx-auto rounded-xl bg-red-50 text-red-600">
        <AlertTriangle size={22} />
      </div>
      <h3 className="mt-3 font-semibold text-ink-800">Unable to load data</h3>
      <p className="mt-1 text-sm text-ink-400">
        {String(error?.message || error || 'Something went wrong')}. Please refresh the dashboard.
      </p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-lg bg-govblue-700 px-4 py-2 text-sm font-medium text-white hover:bg-govblue-800">
          Retry
        </button>
      )}
    </div>
  );
}

// Small inline tag used across pages to honour design rule #7.
export function SimulatedTag({ className = '' }) {
  return (
    <span className={`chip px-2 py-0.5 text-[11px] bg-amber-50 text-amber-700 ring-1 ring-amber-200 ${className}`}>
      <FlaskConical size={11} />
      Simulated for PoC
    </span>
  );
}
