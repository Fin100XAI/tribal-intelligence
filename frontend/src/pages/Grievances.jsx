import {
  MessageSquareWarning, HandCoins, GraduationCap, CreditCard, BedDouble,
  Trees, Clock, AlertOctagon, MapPin, Smile, ListTree, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { navByPath } from '../nav.js';
import { formatNumber, PALETTE } from '../lib/format.js';

import PageHeader from '../components/PageHeader.jsx';
import FilterBar from '../components/FilterBar.jsx';
import KpiRow from '../components/KpiRow.jsx';
import Card from '../components/ui/Card.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import { RiskBadge } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import MahaMap, { MapLegend } from '../components/MahaMap.jsx';
import { Bars, ComboChart, Donut } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  total: MessageSquareWarning, welfare: HandCoins, scholarship: GraduationCap, dbt: CreditCard,
  hostel: BedDouble, land: Trees, resolution: Clock, escalated: AlertOctagon,
};

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };

export default function Grievances() {
  const nav = navByPath('/grievances');
  const { queryParams } = useFilters();
  const { data, loading, error } = useApi(() => api.grievances(queryParams), [JSON.stringify(queryParams)]);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading grievance & citizen trust intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, categories, sentiment, districtHeat, resolutionTrend, recurring } = data;

  const sentimentDonut = sentiment.map((s) => ({
    label: s.label,
    value: s.value,
    color: s.tone === 'good' ? PALETTE.emerald : s.tone === 'bad' ? PALETTE.red : PALETTE.slate,
  }));

  const heatCols = [
    { key: 'name', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'division', label: 'Division', className: 'text-ink-500' },
    { key: 'grievances', label: 'Grievances', align: 'right', render: (v) => formatNumber(v) },
    { key: 'escalated', label: 'Escalated', align: 'right', render: (v) => formatNumber(v) },
    { key: 'resolutionDays', label: 'Avg Resolution', align: 'right', render: (v) => `${v}d` },
    { key: 'satisfaction', label: 'Satisfaction %', align: 'right', render: (v) => <SatCell v={v} /> },
    { key: 'band', label: 'Risk', align: 'center', render: (v) => <RiskBadge band={v} /> },
  ];

  const recurringCols = [
    { key: 'complaint', label: 'Recurring Complaint', render: (v) => <span className="font-medium text-ink-700">{v}</span> },
    { key: 'count', label: 'Cases', align: 'right', render: (v) => formatNumber(v) },
    { key: 'trend', label: 'Trend', align: 'center', render: (v) => {
      const Icon = TREND_ICON[v];
      const color = v === 'up' ? 'text-red-600' : v === 'down' ? 'text-emerald-600' : 'text-ink-400';
      return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}><Icon size={14} />{v}</span>;
    } },
  ];

  return (
    <Shell nav={nav}>
      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="District Grievance Heatmap" subtitle="Grievance density & escalation by district" icon={MapPin} className="xl:col-span-2" action={<MapLegend />}>
          <MahaMap points={districtHeat} height={420} valueLabel="Grievance Score" />
        </Card>
        <Card title="Citizen Sentiment Analysis" subtitle="NLP on grievance text (Simulated)" icon={Smile}>
          <Donut data={sentimentDonut} centerLabel={{ value: `${sentiment.find((s) => s.tone === 'good')?.value}%`, label: 'Positive' }} />
          <div className="mt-3 space-y-1.5">
            {sentiment.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-ink-500">{s.label}</span>
                <span className="font-semibold tabular-nums text-ink-800">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Grievances by Category" subtitle="Department/domain split" icon={ListTree}>
          <Bars data={categories} xKey="category" layout="vertical" bars={[{ key: 'count', name: 'Grievances', color: PALETTE.blue }]} height={300} />
        </Card>
        <Card title="Resolution Performance" subtitle="Received vs resolved & avg resolution days" icon={Clock}>
          <ComboChart data={resolutionTrend} height={300}
            bars={[{ key: 'received', name: 'Received', color: PALETTE.slate }, { key: 'resolved', name: 'Resolved', color: PALETTE.emerald }]}
            lines={[{ key: 'avgDays', name: 'Avg Days', color: PALETTE.saffron }]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Top Recurring Complaints" subtitle="Most frequent categories & trend" icon={AlertOctagon}>
          <DataTable columns={recurringCols} rows={recurring} initialSort={{ key: 'count', dir: 'desc' }} searchable={false} dense />
        </Card>
        <Card title="District Grievance Performance" subtitle="Escalations, resolution time & satisfaction" icon={MessageSquareWarning}>
          <DataTable columns={heatCols} rows={districtHeat} initialSort={{ key: 'grievances', dir: 'desc' }} pageSize={8} dense />
        </Card>
      </div>

      <ComplianceNote />
    </Shell>
  );
}

function SatCell({ v }) {
  const color = v < 60 ? 'text-red-600' : v < 75 ? 'text-saffron-600' : 'text-emerald-600';
  return <span className={`font-semibold tabular-nums ${color}`}>{v}%</span>;
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <FilterBar show={['district', 'division', 'department', 'status', 'date']} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
