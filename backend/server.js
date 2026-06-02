// ---------------------------------------------------------------------------
// Maha Tribal Intelligence Grid — Express API Server
// AI-enabled Tribal Welfare Assurance, Vulnerability Intelligence &
// Human Development Governance Layer for Maharashtra.
// All data is "Simulated for PoC".
// ---------------------------------------------------------------------------
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { DATA } from './data/seed.js';
import {
  buildOverview, buildDistricts, buildDistrictDetail, buildWelfare,
  buildEducation, buildHealth, buildMigration, buildFra,
  buildGrievances, buildCompliance, buildReports,
  filterScale, scaleKpis,
} from './data/builders.js';

const app = express();
// 5050 by default — macOS reserves 5000 for AirPlay Receiver.
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Tiny latency simulation so the frontend loaders are visible (optional)
app.use((req, _res, next) => setTimeout(next, 80));

const ok = (res, payload) => res.json({ success: true, dataMode: 'Simulated for PoC', ...payload });

// Scale a payload's KPI values by the active non-geographic filters so every
// filter visibly changes the dashboard.
const okScaled = (res, req, payload) => {
  const f = filterScale(req.query);
  if (payload.kpis) payload = { ...payload, kpis: scaleKpis(payload.kpis, f), filterFactor: f };
  return ok(res, payload);
};

// --- Health / root ----------------------------------------------------------
app.get('/', (_req, res) => res.json({
  service: 'Maha Tribal Intelligence Grid API',
  status: 'online',
  dataMode: 'Simulated for PoC',
  endpoints: [
    '/api/meta', '/api/filters', '/api/overview', '/api/districts', '/api/district/:id',
    '/api/welfare', '/api/education', '/api/health', '/api/migration',
    '/api/fra', '/api/grievances', '/api/compliance', '/api/reports',
  ],
}));

app.get('/api/health-check', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// --- Meta & filter option master --------------------------------------------
app.get('/api/meta', (_req, res) => ok(res, { meta: DATA.meta }));

app.get('/api/filters', (_req, res) => ok(res, {
  filters: {
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
  },
}));

// --- Module endpoints -------------------------------------------------------
app.get('/api/overview', (req, res) => okScaled(res, req, buildOverview(req.query)));
app.get('/api/districts', (req, res) => ok(res, buildDistricts(req.query)));

app.get('/api/district/:id', (req, res) => {
  const detail = buildDistrictDetail(req.params.id);
  if (!detail) return res.status(404).json({ success: false, error: 'District not found' });
  return okScaled(res, req, detail);
});

app.get('/api/welfare', (req, res) => okScaled(res, req, buildWelfare(req.query)));
app.get('/api/education', (req, res) => okScaled(res, req, buildEducation(req.query)));
app.get('/api/health', (req, res) => okScaled(res, req, buildHealth(req.query)));
app.get('/api/migration', (req, res) => okScaled(res, req, buildMigration(req.query)));
app.get('/api/fra', (req, res) => okScaled(res, req, buildFra(req.query)));
app.get('/api/grievances', (req, res) => okScaled(res, req, buildGrievances(req.query)));
app.get('/api/compliance', (_req, res) => ok(res, buildCompliance()));
app.get('/api/reports', (req, res) => okScaled(res, req, buildReports(req.query)));

// --- Serve the built frontend (production) ----------------------------------
// When `frontend/dist` exists (after `npm run build`), the Express server also
// serves the compiled React app, so the whole platform runs on one port.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  // SPA fallback: any non-API GET returns index.html for client-side routing.
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
  console.log('  → Serving built frontend from frontend/dist');
} else {
  console.log('  → frontend/dist not found — run `npm run build` in /frontend to serve the app from here');
}

// --- 404 + error handler ----------------------------------------------------
app.use((req, res) => res.status(404).json({ success: false, error: `Not found: ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n  Maha Tribal Intelligence Grid API`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Mode: Simulated for PoC`);
  console.log(`  → Coverage: ${DATA.districts.length} districts, ${DATA.blocks.length} blocks, ${DATA.villages.length} villages, ${DATA.schemes.length} schemes\n`);
});
