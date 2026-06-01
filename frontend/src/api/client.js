// Lightweight fetch wrapper. In dev, /api is proxied to the Express backend.
const BASE = '/api';

function qs(params = {}) {
  const clean = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all',
  );
  if (!clean.length) return '';
  return '?' + clean.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

async function get(path, params) {
  const res = await fetch(`${BASE}${path}${qs(params)}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  filters: () => get('/filters'),
  meta: () => get('/meta'),
  overview: (p) => get('/overview', p),
  districts: (p) => get('/districts', p),
  district: (id, p) => get(`/district/${id}`, p),
  welfare: (p) => get('/welfare', p),
  education: (p) => get('/education', p),
  health: (p) => get('/health', p),
  migration: (p) => get('/migration', p),
  fra: (p) => get('/fra', p),
  grievances: (p) => get('/grievances', p),
  compliance: (p) => get('/compliance', p),
  reports: (p) => get('/reports', p),
};
