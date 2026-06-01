import {
  FileStack, CheckCircle2, Clock, XCircle, Timer, Users, User,
  AlertTriangle, MapPin, Trees, BarChart3, ScrollText,
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
import { RiskBadge, StatusBadge, Pill } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import MahaMap, { MapLegend } from '../components/MahaMap.jsx';
import { Donut, ComboChart, Bars } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  received: FileStack, approved: CheckCircle2, pending: Clock, rejected: XCircle,
  delay: Timer, cfr: Users, ifr: User, disputes: AlertTriangle,
};

export default function Fra() {
  const nav = navByPath('/fra');
  const { queryParams } = useFilters();
  const { data, loading, error } = useApi(() => api.fra(queryParams), [JSON.stringify(queryParams)]);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading land & forest rights intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, claimStatus, districtPerformance, geoClaims, villageBacklog, progressTrend } = data;

  const perfCols = [
    { key: 'district', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'division', label: 'Division', className: 'text-ink-500' },
    { key: 'received', label: 'Received', align: 'right', render: (v) => formatNumber(v) },
    { key: 'approved', label: 'Approved', align: 'right', render: (v) => formatNumber(v) },
    { key: 'pending', label: 'Pending', align: 'right', render: (v) => formatNumber(v) },
    { key: 'rejected', label: 'Rejected', align: 'right', render: (v) => formatNumber(v) },
    { key: 'approvalRate', label: 'Approval %', align: 'right', render: (v) => <RateCell v={v} /> },
    { key: 'avgDelayDays', label: 'Avg Delay', align: 'right', render: (v) => `${v}d` },
    { key: 'disputes', label: 'Disputes', align: 'right' },
  ];

  const backlogCols = [
    { key: 'village', label: 'Village', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'block', label: 'Block', className: 'text-ink-500' },
    { key: 'district', label: 'District', className: 'text-ink-500' },
    { key: 'tribalGroup', label: 'Tribal Group', render: (v) => <Pill>{v}</Pill> },
    { key: 'backlog', label: 'Pending Claims', align: 'right', render: (v) => <span className="font-bold text-saffron-600 tabular-nums">{formatNumber(v)}</span> },
  ];

  const geoTableCols = [
    { key: 'name', label: 'Village', render: (v) => <span className="font-medium text-ink-800">{v}</span> },
    { key: 'district', label: 'District', className: 'text-ink-500' },
    { key: 'backlog', label: 'Backlog', align: 'right' },
    { key: 'status', label: 'Stage', align: 'center', render: (v) => <StatusBadge status={v} /> },
    { key: 'band', label: 'Risk', align: 'center', render: (v) => <RiskBadge band={v} /> },
  ];

  const statusColors = [PALETTE.emerald, PALETTE.amber, PALETTE.red];

  return (
    <Shell nav={nav}>
      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Geo-tagged FRA Claim Status" subtitle="Village backlog & dispute-risk clusters" icon={MapPin} className="xl:col-span-2" action={<MapLegend />}>
          <MahaMap points={geoClaims.map((g) => ({ ...g, score: Math.min(100, g.backlog) }))} height={420} valueLabel="Backlog" />
        </Card>
        <Card title="Claim Status Mix" subtitle="Approved · Pending · Rejected" icon={ScrollText}>
          <Donut data={claimStatus} nameKey="status" colors={statusColors} centerLabel={{ label: 'Total Claims' }} />
        </Card>
      </div>

      <Card title="Forest Rights Progress" subtitle="Received vs approved vs pending · 12 months" icon={BarChart3}>
        <ComboChart data={progressTrend} height={280}
          bars={[{ key: 'received', name: 'Received', color: PALETTE.blue }, { key: 'approved', name: 'Approved', color: PALETTE.emerald }]}
          lines={[{ key: 'pending', name: 'Pending', color: PALETTE.saffron }]}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Village-wise FRA Backlog" subtitle="Highest pending claims first" icon={Trees}>
          <DataTable columns={backlogCols} rows={villageBacklog} initialSort={{ key: 'backlog', dir: 'desc' }} pageSize={8} dense />
        </Card>
        <Card title="Dispute-risk & Geo Status" subtitle="Claim stage by village" icon={AlertTriangle}>
          <DataTable columns={geoTableCols} rows={geoClaims} initialSort={{ key: 'backlog', dir: 'desc' }} pageSize={8} dense />
        </Card>
      </div>

      <Card title="District FRA Performance" subtitle="Approval rate, delays & disputes · lowest approval first" icon={FileStack}>
        <DataTable columns={perfCols} rows={districtPerformance} initialSort={{ key: 'approvalRate', dir: 'asc' }} dense />
      </Card>

      <ComplianceNote />
    </Shell>
  );
}

function RateCell({ v }) {
  const color = v < 55 ? 'text-red-600' : v < 68 ? 'text-saffron-600' : 'text-emerald-600';
  return <span className={`font-semibold tabular-nums ${color}`}>{v}%</span>;
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <FilterBar show={['district', 'division', 'tribal', 'status', 'date']} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
