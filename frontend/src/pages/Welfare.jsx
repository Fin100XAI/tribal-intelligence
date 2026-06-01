import {
  Users, FileCheck2, CheckCircle2, BadgeIndianRupee, Fingerprint, Landmark,
  Clock, AlertTriangle, Filter, Building2, XCircle, GitBranch,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { navByPath } from '../nav.js';
import { formatNumber, compactNumber, PALETTE } from '../lib/format.js';

import PageHeader from '../components/PageHeader.jsx';
import FilterBar from '../components/FilterBar.jsx';
import KpiRow from '../components/KpiRow.jsx';
import Card from '../components/ui/Card.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import { Pill } from '../components/ui/Badge.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import { FunnelBars, Bars, Donut, TrendArea } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  eligible: Users, applied: FileCheck2, approved: CheckCircle2, received: BadgeIndianRupee,
  aadhaar: Fingerprint, bank: Landmark, pending: Clock, anomaly: AlertTriangle,
};

export default function Welfare() {
  const nav = navByPath('/welfare');
  const { queryParams } = useFilters();
  const { data, loading, error } = useApi(() => api.welfare(queryParams), [JSON.stringify(queryParams)]);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading welfare assurance intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, funnel, dbtLinkage, schemeCoverage, deptBottlenecks, rejectionReasons, deliveryDelay } = data;

  const linkageDonut = [
    { label: 'Aadhaar Seeded', value: dbtLinkage.aadhaarSeeded, color: PALETTE.emerald },
    { label: 'Pending Seeding', value: +(100 - dbtLinkage.aadhaarSeeded).toFixed(1), color: PALETTE.amber },
  ];

  const schemeCols = [
    { key: 'scheme', label: 'Scheme', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'dept', label: 'Department', className: 'text-ink-500', render: (v) => <Pill>{v}</Pill> },
    { key: 'category', label: 'Category', className: 'text-ink-500' },
    { key: 'target', label: 'Target', align: 'right', render: (v) => formatNumber(v) },
    { key: 'covered', label: 'Covered', align: 'right', render: (v) => formatNumber(v) },
    { key: 'coveragePct', label: 'Coverage', align: 'right', render: (v) => <CoverageBar pct={v} /> },
    { key: 'expenditureCr', label: 'Expenditure', align: 'right', render: (v) => `₹${v} Cr` },
    { key: 'pending', label: 'Pending', align: 'right', render: (v) => formatNumber(v) },
    { key: 'delayDays', label: 'Avg Delay', align: 'right', render: (v) => `${v}d` },
  ];

  const deptCols = [
    { key: 'dept', label: 'Department', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'pending', label: 'Pending Cases', align: 'right', render: (v) => formatNumber(v) },
    { key: 'avgDelayDays', label: 'Avg Delay (days)', align: 'right' },
    { key: 'slaBreaches', label: 'SLA Breaches', align: 'right' },
    { key: 'throughput', label: 'Throughput %', align: 'right', render: (v) => <CoverageBar pct={v} /> },
  ];

  const rejCols = [
    { key: 'reason', label: 'Rejection Reason', render: (v) => <span className="font-medium text-ink-700">{v}</span> },
    { key: 'count', label: 'Cases', align: 'right', render: (v) => formatNumber(v) },
    { key: 'share', label: 'Share', align: 'right', render: (v) => `${v}%` },
  ];

  return (
    <Shell nav={nav}>
      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Benefit Delivery Funnel" subtitle="Eligible → Applied → Approved → Received" icon={GitBranch}>
          <FunnelBars data={funnel} color={PALETTE.blue} />
        </Card>
        <Card title="MahaDBT Linkage Status" subtitle="Aadhaar seeding completeness" icon={Fingerprint}>
          <Donut data={linkageDonut} centerLabel={{ value: `${dbtLinkage.aadhaarSeeded}%`, label: 'Aadhaar Seeded' }} />
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <Mini label="Bank Linked" value={`${dbtLinkage.bankLinked}%`} />
            <Mini label="MahaDBT Mapped" value={`${dbtLinkage.mahaDbtMapped}%`} />
            <Mini label="Bank Failures" value={compactNumber(dbtLinkage.bankFailures)} tone="danger" />
          </div>
        </Card>
        <Card title="Benefit Delivery Delay" subtitle="On-time vs delayed vs failed (%)" icon={Clock}>
          <TrendArea data={deliveryDelay} stacked areas={[
            { key: 'onTime', name: 'On-time', color: PALETTE.emerald },
            { key: 'delayed', name: 'Delayed', color: PALETTE.amber },
            { key: 'failed', name: 'Failed', color: PALETTE.red },
          ]} valueFmt={(v) => `${v}%`} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Department-wise Bottlenecks" subtitle="Pendency, SLA breaches & throughput" icon={Building2}>
          <DataTable columns={deptCols} rows={deptBottlenecks} initialSort={{ key: 'avgDelayDays', dir: 'desc' }} dense searchable={false} />
        </Card>
        <Card title="Rejected Applications — Reasons" subtitle="Root-cause distribution" icon={XCircle}>
          <Bars data={rejectionReasons} xKey="reason" layout="vertical" bars={[{ key: 'count', name: 'Cases', color: PALETTE.red }]} height={260} />
          <div className="mt-3"><DataTable columns={rejCols} rows={rejectionReasons} searchable={false} dense /></div>
        </Card>
      </div>

      <Card title="Scheme-wise Coverage" subtitle="25 schemes · lowest coverage first · sortable & searchable" icon={Filter}>
        <DataTable columns={schemeCols} rows={schemeCoverage} initialSort={{ key: 'coveragePct', dir: 'asc' }} pageSize={10} dense />
      </Card>

      <ComplianceNote />
    </Shell>
  );
}

function CoverageBar({ pct }) {
  const color = pct >= 80 ? PALETTE.emerald : pct >= 60 ? PALETTE.blue : pct >= 45 ? PALETTE.amber : PALETTE.red;
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="h-1.5 w-16 rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="tabular-nums text-xs font-semibold text-ink-700 w-10 text-right">{pct}%</span>
    </div>
  );
}

function Mini({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-ink-50/70 px-2 py-1.5">
      <p className={`text-sm font-bold tabular-nums ${tone === 'danger' ? 'text-red-600' : 'text-ink-800'}`}>{value}</p>
      <p className="text-[10px] text-ink-400 leading-tight">{label}</p>
    </div>
  );
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <FilterBar show={['district', 'division', 'department', 'scheme', 'status', 'date']} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
