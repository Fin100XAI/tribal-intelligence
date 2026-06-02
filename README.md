# Maha Tribal Intelligence Grid

**AI-enabled Tribal Welfare Assurance, Vulnerability Intelligence & Human Development Governance Layer for Maharashtra.**

A government-grade command **dashboard** (PoC) for the Tribal Development Department, Government of Maharashtra — built for the CM Office, Chief Secretary, Principal Secretary, District Collectors and MahaIT.

> 🚫 **No backend / no API / no external calls.** This is a pure **frontend-only** dashboard. All data is generated deterministically **in the browser** and is clearly labelled **"Simulated for PoC"**. Fonts, map styles and the map itself are fully bundled — the app makes **zero network requests** and runs completely offline.
>
> 🧭 **Responsible AI:** AI outputs are decision-support indicators only. Final action remains with authorized government officials through human-in-the-loop review.

---

## Tech stack

| Layer    | Technology |
|----------|-----------|
| Framework | React 18 + Vite |
| Styling  | Tailwind CSS (clean premium **white** theme) |
| Charts   | Recharts |
| Maps     | Leaflet + React-Leaflet |
| Icons    | Lucide React |
| Data     | Generated in-browser (`src/data/`) — **no server** |

---

## Run it

You need **Node.js 18+**.

```bash
cd frontend
npm install
npm run dev
# → open http://localhost:3000
```

That's it — one command, no backend to start.

### Production build

```bash
cd frontend
npm run build      # outputs frontend/dist/ (the build files)
npm run preview    # serves the build at http://localhost:4173
```

The `frontend/dist/` folder is the self-contained build. Because there is no
backend, you can host `dist/` on **any static host** (Netlify, Vercel, GitHub
Pages, S3, Nginx, etc.) — just upload the folder.

---

## Project structure

```
tribal intell poc/
├── README.md
└── frontend/
    ├── package.json
    ├── vite.config.js            # dev server only (no proxy, no backend)
    ├── tailwind.config.js        # government palette: saffron, deep blue, emerald, slate
    ├── index.html
    ├── dist/                     # production build output (after `npm run build`)
    └── src/
        ├── main.jsx, App.jsx, nav.js
        ├── data/
        │   ├── seed.js           # deterministic master data (districts, blocks, villages, schemes)
        │   └── builders.js       # builds every page's dataset + filter logic
        ├── api/client.js         # local data accessor (in-browser, NOT a network call)
        ├── context/FilterContext.jsx
        ├── hooks/useApi.js
        ├── lib/format.js         # ₹ / Indian-locale formatting, risk colors
        ├── components/
        │   ├── layout/ (Sidebar, Header, Layout)
        │   ├── charts/Charts.jsx
        │   ├── ui/ (Card, KpiCard, DataTable, Modal, Select, Badge, AlertBanner, States)
        │   ├── MahaMap.jsx, FilterBar.jsx, KpiRow.jsx, PageHeader.jsx, ComplianceNote.jsx
        └── pages/                # the 10 dashboards
```

> All data lives in `src/data/`. Want different numbers? Edit `seed.js` /
> `builders.js` — no API, no database.

---

## Modules (pages)

1. **Executive Command** — CM / Chief Secretary state view: 12 KPIs, Maharashtra tribal-risk heatmap, district ranking, urgent governance alerts, drill-down modal.
2. **District Intelligence** — Collector view: district/block/village selectors, household vulnerability, GIS village clusters, intervention priority list, block comparison.
3. **Welfare Assurance** — Eligible→Applied→Approved→Received funnel, MahaDBT/Aadhaar linkage, rejection reasons, department bottlenecks, 25-scheme coverage.
4. **Education & Hostels** — Scholarships, hostel occupancy/utilization, dropout-risk prediction, gender continuation, hostel performance table.
5. **Nutrition & Health** — Maternal/child malnutrition, anemia, immunization, seasonal disease trends, intervention map, health-worker tracking.
6. **Migration & Livelihood** — Seasonal migration heatmap, source villages, destination corridors, MGNREGA/SHG/Van Dhan, livelihood-stress table.
7. **Land & Forest Rights (FRA)** — Claim pipeline, approval delay, geo-tagged status, village backlog, district performance.
8. **Grievance & Citizen Trust** — Category split, sentiment analysis, resolution performance, district heatmap, recurring complaints.
9. **Responsible AI & Compliance** — Human-in-the-loop, model confidence gauge, explainability, bias monitoring, DPDP checklist, RBAC, CERT-In incident panel, audit logs.
10. **Reports & Decision Briefs** — Auto-generated CM/Collector/PS briefs, monthly summary, top-10 priorities, risk escalation matrix, **PDF (print) & CSV export**.

---

## Design & compliance notes

- **White theme only.** Accents: saffron, deep blue, emerald, slate — used with restraint.
- **Fully responsive** — mobile hamburger drawer, sticky compact filter bar, responsive grids, zero overlap on mobile / tablet / desktop.
- **₹ (Indian Rupee)** for every financial value, with Indian-locale grouping and Cr/Lakh compaction. No `$` anywhere.
- **No empty states** — every section is populated with realistic simulated data; filter combinations never produce blank/zero cards.
- **Working filters** — district, division, department, scheme, gender, age group, tribal group, vulnerability category, date range, risk level, status — plus global search, district selector, sortable/searchable tables, and a drill-down modal. Every filter visibly changes the data.
- **Exports** — PDF via browser print (dedicated print stylesheet); CSV downloads real files client-side.

### Sample data coverage
12 districts · 40 blocks · 150 villages · 25 schemes · 10,000+ simulated beneficiary records (summarized) · ₹ crore-level expenditure · district risk scores · village vulnerability scores.

**Districts:** Nandurbar, Gadchiroli, Palghar, Nashik, Dhule, Chandrapur, Yavatmal, Amravati, Thane, Raigad, Ahmednagar, Pune (Tribal Belt).
