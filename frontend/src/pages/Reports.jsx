import {
  FileText, FileDown, Printer, Sparkles, ListOrdered, Grid3x3, CalendarRange,
  Building2, Crown, FileSignature, ClipboardList,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { navByPath } from '../nav.js';
import { formatNumber, PALETTE } from '../lib/format.js';

import PageHeader from '../components/PageHeader.jsx';
import FilterBar from '../components/FilterBar.jsx';
import Card from '../components/ui/Card.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import { RiskBadge, Pill } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import { ComboChart } from '../components/charts/Charts.jsx';

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const nav = navByPath('/reports');
  const { queryParams } = useFilters();
  const { data, loading, error } = useApi(() => api.reports(queryParams), [JSON.stringify(queryParams)]);

  if (loading) return <Shell nav={nav}><LoadingState label="Compiling decision briefs…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { cmBrief, collectorBrief, psNote, top10, escalationMatrix, monthlySummary, reportList } = data;

  const top10Cols = [
    { key: 'rank', label: '#', align: 'center', render: (v) => <span className="font-bold text-ink-700">{v}</span> },
    { key: 'village', label: 'Village', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'block', label: 'Block', className: 'text-ink-500' },
    { key: 'district', label: 'District', className: 'text-ink-500' },
    { key: 'score', label: 'Vuln. Score', align: 'right', render: (v) => <span className="font-bold tabular-nums">{v}</span> },
    { key: 'band', label: 'Band', align: 'center', render: (v) => <RiskBadge band={v} /> },
    { key: 'recommendedAction', label: 'Recommended Action', render: (v) => <Pill tone="saffron">{v}</Pill>, sortable: false },
  ];

  const escCols = [
    { key: 'district', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'likelihood', label: 'Likelihood', align: 'center', render: (v) => <MatrixCell v={v} /> },
    { key: 'impact', label: 'Impact', align: 'center', render: (v) => <MatrixCell v={v} /> },
    { key: 'riskScore', label: 'Risk Score', align: 'right', render: (v) => <span className="font-semibold tabular-nums">{v}</span> },
    { key: 'band', label: 'Band', align: 'center', render: (v) => <RiskBadge band={v} /> },
    { key: 'owner', label: 'Owner', className: 'text-ink-500' },
  ];

  const reportCols = [
    { key: 'name', label: 'Report', render: (v) => <span className="font-medium text-ink-800">{v}</span> },
    { key: 'type', label: 'Type', render: (v) => <Pill tone="blue">{v}</Pill> },
    { key: 'generated', label: 'Generated', className: 'text-ink-500' },
    { key: 'pages', label: 'Pages', align: 'right' },
    { key: 'format', label: '', align: 'right', sortable: false, render: (v, r) => (
      <button
        onClick={() => r.format === 'CSV' ? downloadCSV(`${r.id}-${r.name}.csv`, monthlySummary) : window.print()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
      >
        {v === 'CSV' ? <FileDown size={13} /> : <Printer size={13} />} {v}
      </button>
    ) },
  ];

  return (
    <Shell nav={nav}>
      {/* Export action bar */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-800">Monthly Performance & Decision Briefs — June 2026</p>
            <p className="text-xs text-ink-400 mt-0.5">Auto-generated from live intelligence layer · honour current filters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-govblue-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-govblue-800">
              <Printer size={15} /> Export PDF
            </button>
            <button onClick={() => downloadCSV('escalation-matrix.csv', escalationMatrix)} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">
              <FileDown size={15} /> Risk Matrix CSV
            </button>
            <button onClick={() => downloadCSV('top10-priorities.csv', top10)} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">
              <FileDown size={15} /> Top 10 CSV
            </button>
          </div>
        </div>
      </Card>

      {/* Briefs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="CM Office — State Brief" subtitle={cmBrief.period} icon={Crown}>
          <p className="text-[13px] leading-relaxed text-ink-600">{cmBrief.summary}</p>
          <ul className="mt-3 space-y-2">
            {cmBrief.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                <Sparkles size={14} className="mt-0.5 text-saffron-500 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="District Collector — Action Brief" subtitle={`Priority district: ${collectorBrief.district}`} icon={Building2}>
          <ol className="space-y-2 list-none">
            {collectorBrief.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-ink-700">
                <span className="grid place-items-center h-5 w-5 rounded-md bg-govblue-100 text-govblue-700 text-[11px] font-bold shrink-0">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Principal Secretary — Review Note" subtitle="Tribal Development Dept." icon={FileSignature}>
          <ul className="space-y-2">
            {psNote.points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Monthly Performance Summary" subtitle="Expenditure, beneficiaries & risk index" icon={CalendarRange}>
        <ComboChart data={monthlySummary} height={280}
          bars={[{ key: 'expenditureCr', name: 'Expenditure (₹ Cr)', color: PALETTE.emerald }]}
          lines={[{ key: 'riskIndex', name: 'Risk Index', color: PALETTE.saffron }]}
          valueFmt={(v) => formatNumber(v)}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Top 10 Intervention Priorities" subtitle="State-wide AI-ranked villages" icon={ListOrdered}
          action={<button onClick={() => downloadCSV('top10-priorities.csv', top10)} className="inline-flex items-center gap-1 text-xs font-medium text-govblue-700 hover:underline"><FileDown size={13} /> CSV</button>}>
          <DataTable columns={top10Cols} rows={top10} searchable={false} dense />
        </Card>
        <Card title="Risk Escalation Matrix" subtitle="Likelihood × impact by district" icon={Grid3x3}
          action={<button onClick={() => downloadCSV('escalation-matrix.csv', escalationMatrix)} className="inline-flex items-center gap-1 text-xs font-medium text-govblue-700 hover:underline"><FileDown size={13} /> CSV</button>}>
          <DataTable columns={escCols} rows={escalationMatrix} initialSort={{ key: 'riskScore', dir: 'desc' }} pageSize={8} dense />
        </Card>
      </div>

      <Card title="Generated Reports Library" subtitle="Download or print decision-ready documents" icon={ClipboardList}>
        <DataTable columns={reportCols} rows={reportList} searchable={false} dense />
      </Card>

      <ComplianceNote />
    </Shell>
  );
}

function MatrixCell({ v }) {
  const map = { High: 'bg-red-50 text-red-700', Medium: 'bg-saffron-50 text-saffron-700', Low: 'bg-emerald-50 text-emerald-700' };
  return <span className={`chip px-2 py-0.5 text-[11px] font-semibold ${map[v]}`}>{v}</span>;
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <FilterBar show={['district', 'division', 'risk', 'date']} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
