import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ListChecks, HandCoins, IndianRupee, Gauge as GaugeIcon, AlertOctagon,
  CreditCard, GraduationCap, Soup, Truck, Trees, MessageSquareWarning,
  ChevronRight, MapPin, ArrowUpRight,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { navByPath } from '../nav.js';
import { formatNumber, compactNumber, riskColor, relativeTime, PALETTE } from '../lib/format.js';

import PageHeader from '../components/PageHeader.jsx';
import KpiRow from '../components/KpiRow.jsx';
import Card from '../components/ui/Card.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import { RiskBadge, StatusBadge } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import MahaMap, { MapLegend } from '../components/MahaMap.jsx';
import { TrendArea, TrendLine, Bars } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  population: Users, schemes: ListChecks, beneficiaries: HandCoins, expenditure: IndianRupee,
  tdi: GaugeIcon, highrisk: AlertOctagon, dbt: CreditCard, scholarship: GraduationCap,
  nutrition: Soup, migration: Truck, fra: Trees, grievance: MessageSquareWarning,
};

export default function Executive() {
  const nav = navByPath('/');
  const navigate = useNavigate();
  const { queryParams, setFilter } = useFilters();
  const { data, loading, error } = useApi(() => api.overview(queryParams), [JSON.stringify(queryParams)]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading state command intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, ranking, heatmap, alerts, trends, tdiByDivision } = data;

  const rankCols = [
    { key: 'rank', label: '#', align: 'center', render: (v) => <span className="font-bold text-ink-700">{v}</span> },
    { key: 'name', label: 'District', render: (v, r) => (
      <button onClick={() => openDistrict(r)} className="font-semibold text-ink-800 hover:text-govblue-700 inline-flex items-center gap-1">
        {v}<ArrowUpRight size={13} className="text-ink-300" />
      </button>
    ) },
    { key: 'division', label: 'Division', className: 'text-ink-500' },
    { key: 'tdi', label: 'TDI', align: 'right', render: (v) => <span className="font-semibold tabular-nums">{v}</span> },
    { key: 'riskBand', label: 'Risk', align: 'center', render: (v) => <RiskBadge band={v} /> },
    { key: 'welfareCoverage', label: 'Welfare %', align: 'right', render: (v) => `${v}%` },
    { key: 'beneficiaries', label: 'Beneficiaries', align: 'right', render: (v) => compactNumber(v) },
    { key: 'expenditureCr', label: 'Expenditure', align: 'right', render: (v) => `₹${v} Cr` },
    { key: 'dbtFailures', label: 'DBT Fails', align: 'right', render: (v) => formatNumber(v) },
    { key: 'fraBacklog', label: 'FRA Backlog', align: 'right', render: (v) => formatNumber(v) },
  ];

  function openDistrict(r) {
    const full = heatmap.find((h) => h.id === r.id) || r;
    setSelectedDistrict({ ...r, ...full });
  }
  function goToDistrictPage(id) {
    setFilter('district', id);
    navigate('/district');
  }

  return (
    <Shell nav={nav}>
      <KpiRow kpis={kpis} icons={KPI_ICONS} onCardClick={() => {}} />

      {/* Map + alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          title="Maharashtra Tribal-Risk Heatmap"
          subtitle="District composite vulnerability · click a bubble to drill down"
          icon={MapPin}
          className="xl:col-span-2"
          action={<MapLegend />}
        >
          <MahaMap points={heatmap} height={420} valueLabel="Risk Score" onSelect={openDistrict} />
        </Card>

        <Card title="Urgent Governance Alerts" subtitle={`${alerts.length} active`} icon={AlertOctagon}>
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {alerts.map((a) => {
              const c = riskColor(a.severity);
              return (
                <div key={a.id} className={`rounded-xl border ${c.ring} ring-1 ${c.bg} p-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip px-2 py-0.5 text-[10px] bg-white/70 text-ink-700 font-semibold">{a.type}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium text-ink-800 leading-snug">{a.message}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-400">
                    <span>{a.owner}</span>
                    <span>{relativeTime(a.raisedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Welfare Expenditure Monitored" subtitle="₹ crore · trailing 12 months" icon={IndianRupee}>
          <TrendArea data={trends.welfareExpenditure} areas={[{ key: 'value', name: 'Expenditure (₹ Cr)', color: PALETTE.emerald }]} valueFmt={(v) => `₹${v} Cr`} />
        </Card>
        <Card title="DBT Failure Alerts" subtitle="Open failures per cycle" icon={CreditCard}>
          <TrendArea data={trends.dbtFailures} areas={[{ key: 'value', name: 'DBT Failures', color: PALETTE.saffron }]} />
        </Card>
        <Card title="State Vulnerability Index" subtitle="Composite risk (lower is better)" icon={GaugeIcon}>
          <TrendLine data={trends.riskIndex} lines={[{ key: 'value', name: 'Risk Index', color: PALETTE.blue }]} />
        </Card>
      </div>

      {/* Division comparison + ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Division-wise TDI vs Risk" subtitle="Tribal Development Index by revenue division" icon={GaugeIcon}>
          <Bars
            data={tdiByDivision}
            xKey="division"
            bars={[
              { key: 'tdi', name: 'TDI', color: PALETTE.blue },
              { key: 'risk', name: 'Risk', color: PALETTE.saffron },
            ]}
            height={260}
          />
        </Card>
        <Card title="District Ranking & Tribal Development Index" subtitle="Sortable · click a district to open drill-down" icon={ListChecks} className="lg:col-span-2">
          <DataTable columns={rankCols} rows={ranking} initialSort={{ key: 'rank', dir: 'asc' }} pageSize={8} dense />
        </Card>
      </div>

      <ComplianceNote />

      <Modal
        open={!!selectedDistrict}
        onClose={() => setSelectedDistrict(null)}
        title={selectedDistrict?.name}
        subtitle={`${selectedDistrict?.division} Division · Rank #${selectedDistrict?.rank} · ${selectedDistrict?.riskBand} risk`}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setSelectedDistrict(null)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">Close</button>
            <button onClick={() => goToDistrictPage(selectedDistrict.id)} className="rounded-lg bg-govblue-700 px-4 py-2 text-sm font-medium text-white hover:bg-govblue-800 inline-flex items-center gap-1.5">
              Open District Intelligence <ChevronRight size={15} />
            </button>
          </div>
        }
      >
        {selectedDistrict && <DistrictPeek d={selectedDistrict} />}
      </Modal>
    </Shell>
  );
}

function DistrictPeek({ d }) {
  const rows = [
    { label: 'Tribal Population', value: formatNumber(d.tribalPopulation) },
    { label: 'Beneficiaries', value: formatNumber(d.beneficiaries) },
    { label: 'Tribal Development Index', value: d.tdi },
    { label: 'Risk Score', value: d.riskScore },
    { label: 'Welfare Coverage', value: `${d.welfareCoverage ?? '—'}%` },
    { label: 'Expenditure Monitored', value: d.expenditureCr ? `₹${d.expenditureCr} Cr` : '—' },
    { label: 'DBT Failures', value: formatNumber(d.dbtFailures) },
    { label: 'FRA Backlog', value: formatNumber(d.fraBacklog) },
  ];
  return (
    <div>
      <div className="mb-3"><RiskBadge band={d.riskBand} size="md" /></div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl bg-ink-50/70 px-3 py-2.5">
            <p className="text-[11px] text-ink-400">{r.label}</p>
            <p className="text-sm font-semibold text-ink-800 tabular-nums">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
