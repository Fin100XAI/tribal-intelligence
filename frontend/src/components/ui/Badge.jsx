import { riskColor } from '../../lib/format.js';

export function RiskBadge({ band, size = 'sm' }) {
  const c = riskColor(band);
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span className={`chip ${pad} ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
      {band}
    </span>
  );
}

const STATUS_STYLES = {
  Compliant: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'In Review': 'bg-amber-50 text-amber-700 ring-amber-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In Action': 'bg-govblue-50 text-govblue-700 ring-govblue-200',
  'In Progress': 'bg-govblue-50 text-govblue-700 ring-govblue-200',
  Acknowledged: 'bg-govblue-50 text-govblue-700 ring-govblue-200',
  New: 'bg-govblue-50 text-govblue-700 ring-govblue-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
  Escalated: 'bg-red-50 text-red-700 ring-red-200',
  Closed: 'bg-ink-50 text-ink-600 ring-ink-200',
  Mitigated: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

export function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-ink-50 text-ink-600 ring-ink-200';
  return <span className={`chip px-2 py-0.5 text-xs ring-1 ${cls}`}>{status}</span>;
}

export function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-ink-50 text-ink-600',
    blue: 'bg-govblue-50 text-govblue-700',
    saffron: 'bg-saffron-50 text-saffron-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return <span className={`chip px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}
