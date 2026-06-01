import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatValue } from '../../lib/format.js';

const TONE = {
  default: { accent: 'bg-govblue-500', icon: 'text-govblue-700 bg-govblue-50' },
  danger: { accent: 'bg-red-500', icon: 'text-red-700 bg-red-50' },
  warning: { accent: 'bg-saffron-500', icon: 'text-saffron-700 bg-saffron-50' },
  good: { accent: 'bg-emerald-500', icon: 'text-emerald-700 bg-emerald-50' },
};

// A KPI tile: big value, label, optional trend indicator and sub-text.
// `trendGood` controls whether a positive trend is shown green or red.
export default function KpiCard({ label, value, format, trend, sub, tone = 'default', icon: Icon, trendGood = true, onClick }) {
  const t = TONE[tone] || TONE.default;
  const hasTrend = trend !== undefined && trend !== null;
  const positive = hasTrend && trend > 0;
  const flat = hasTrend && trend === 0;
  // For "bad" metrics (warning/danger) a decrease is good.
  const isGood = positive === trendGood;
  const trendColor = flat ? 'text-ink-400' : isGood ? 'text-emerald-600' : 'text-red-600';
  const TrendIcon = flat ? Minus : positive ? ArrowUpRight : ArrowDownRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative text-left w-full gov-card p-4 transition-shadow hover:shadow-cardhover ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${t.accent}`} />
      <div className="flex items-start justify-between gap-2 pl-2">
        <p className="text-[11px] sm:text-xs font-medium text-ink-400 leading-snug">{label}</p>
        {Icon && (
          <span className={`grid place-items-center h-7 w-7 rounded-lg shrink-0 ${t.icon}`}>
            <Icon size={15} />
          </span>
        )}
      </div>
      <div className="pl-2 mt-1.5 flex items-end gap-2 flex-wrap">
        <span className="text-xl sm:text-2xl font-bold text-ink-800 tracking-tight tabular-nums">
          {formatValue(value, format)}
        </span>
        {hasTrend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trendColor} mb-0.5`}>
            <TrendIcon size={13} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <p className="pl-2 mt-0.5 text-[11px] text-ink-400 truncate">{sub}</p>}
    </button>
  );
}
