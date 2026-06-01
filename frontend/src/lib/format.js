// Indian-locale formatting helpers. ₹ is used for ALL financial values.

export function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN');
}

// Indian short scale: K, Lakh, Cr
export function compactNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return formatNumber(n);
}

export function formatValue(value, format) {
  switch (format) {
    case 'number':
      return compactNumber(value);
    case 'crore':
      return `₹${formatNumber(value)} Cr`;
    case 'rupee':
      return `₹${formatNumber(value)}`;
    case 'percent':
      return `${value}%`;
    case 'index':
      return `${value}`;
    case 'days':
      return `${value} days`;
    default:
      return formatNumber(value);
  }
}

export const RISK_COLORS = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', dot: '#dc2626', hex: '#dc2626' },
  High: { bg: 'bg-saffron-50', text: 'text-saffron-700', ring: 'ring-saffron-200', dot: '#ea580c', hex: '#ea580c' },
  Moderate: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: '#d97706', hex: '#d97706' },
  Watch: { bg: 'bg-govblue-50', text: 'text-govblue-700', ring: 'ring-govblue-200', dot: '#2563eb', hex: '#2563eb' },
  Stable: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-100', dot: '#059669', hex: '#059669' },
};

export function riskColor(band) {
  return RISK_COLORS[band] || RISK_COLORS.Watch;
}

// shared chart palette
export const PALETTE = {
  saffron: '#ea580c',
  blue: '#1d4ed8',
  emerald: '#059669',
  slate: '#475569',
  amber: '#d97706',
  red: '#dc2626',
  violet: '#7c3aed',
  teal: '#0d9488',
};
export const CHART_SERIES = [PALETTE.blue, PALETTE.saffron, PALETTE.emerald, PALETTE.violet, PALETTE.amber, PALETTE.teal];

export function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
