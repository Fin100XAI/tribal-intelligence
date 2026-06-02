// ---------------------------------------------------------------------------
// Local data layer — NO backend required.
// The same deterministic "Simulated for PoC" data model that previously lived
// in the Express server now runs entirely in the browser. The `api` object
// keeps the exact same async interface, so pages/hooks are unchanged.
// ---------------------------------------------------------------------------
import { DATA } from '../data/seed.js';
import {
  buildOverview, buildDistricts, buildDistrictDetail, buildWelfare,
  buildEducation, buildHealth, buildMigration, buildFra,
  buildGrievances, buildCompliance, buildReports,
  filterScale, scaleKpis,
} from '../data/builders.js';

// Small artificial latency so loading states render smoothly (feels live).
const settle = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 140));

// Count-type fields that get scaled uniformly by the filter factor so that
// charts AND tables (not just KPI cards) respond to every filter. Percentages,
// scores, indices, coordinates, days and identifiers are deliberately excluded
// so ratios stay correct. A single uniform factor preserves relationships
// (e.g. approved < applied still holds).
const COUNT_KEYS = new Set([
  'target', 'covered', 'pending', 'count', 'beneficiaries', 'enrolled', 'occupancy',
  'households', 'population', 'volume', 'received', 'approved', 'rejected', 'sam', 'mam',
  'visitsPlanned', 'visitsDone', 'asha', 'anm', 'grievances', 'escalated', 'predictedDropouts',
  'migratingHouseholds', 'shgGroups', 'vandhanKendras', 'disputes', 'backlog', 'cfr',
  'scholarshipApproved', 'scholarshipPending', 'expenditureCr', 'predicted',
]);

function scaleCounts(node, f) {
  if (Array.isArray(node)) return node.map((n) => scaleCounts(n, f));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'number' && COUNT_KEYS.has(k)) out[k] = k === 'expenditureCr' ? Math.round(v * f * 10) / 10 : Math.max(1, Math.round(v * f));
      else out[k] = scaleCounts(v, f);
    }
    return out;
  }
  return node;
}

// Apply the active non-geographic filters to a payload, so every filter visibly
// changes the dashboard (KPI cards + count-based charts and tables).
function scaled(payload, params = {}) {
  const f = filterScale(params);
  if (!payload) return { dataMode: 'Simulated for PoC' };
  if (f === 1) return { ...payload, dataMode: 'Simulated for PoC', filterFactor: 1 };
  const scaledPayload = scaleCounts(payload, f);
  if (scaledPayload.kpis) scaledPayload.kpis = scaleKpis(payload.kpis, f); // KPIs scale by format, not key
  return { ...scaledPayload, dataMode: 'Simulated for PoC', filterFactor: f };
}

const filterOptions = {
  districts: DATA.districts.map((d) => ({ id: d.id, name: d.name, division: d.division })),
  divisions: DATA.divisions,
  departments: DATA.departments,
  schemes: DATA.schemes.map((s) => ({ id: s.id, name: s.name })),
  tribalGroups: DATA.tribalGroups,
  pvtg: DATA.pvtg,
  vulnerabilityCategories: DATA.vulnerabilityCategories,
  genders: ['All', 'Male', 'Female', 'Other'],
  ageGroups: ['0-6 yrs', '6-14 yrs', '14-18 yrs', '18-35 yrs', '35-60 yrs', '60+ yrs'],
  riskLevels: ['Critical', 'High', 'Moderate', 'Watch', 'Stable'],
  statuses: ['New', 'In Progress', 'Approved', 'Pending', 'Rejected', 'Escalated', 'Resolved'],
};

export const api = {
  filters: () => settle({ filters: filterOptions }),
  meta: () => settle({ meta: DATA.meta }),
  overview: (p = {}) => settle(scaled(buildOverview(p), p)),
  districts: (p = {}) => settle({ ...buildDistricts(p), dataMode: 'Simulated for PoC' }),
  district: (id, p = {}) => settle(scaled(buildDistrictDetail(id), p)),
  welfare: (p = {}) => settle(scaled(buildWelfare(p), p)),
  education: (p = {}) => settle(scaled(buildEducation(p), p)),
  health: (p = {}) => settle(scaled(buildHealth(p), p)),
  migration: (p = {}) => settle(scaled(buildMigration(p), p)),
  fra: (p = {}) => settle(scaled(buildFra(p), p)),
  grievances: (p = {}) => settle(scaled(buildGrievances(p), p)),
  compliance: (p = {}) => settle(scaled(buildCompliance(), p)),
  reports: (p = {}) => settle(scaled(buildReports(p), p)),
};
