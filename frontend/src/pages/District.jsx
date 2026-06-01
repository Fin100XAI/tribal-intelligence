import { useMemo, useState } from 'react';
import {
  Gauge as GaugeIcon, ShieldAlert, GraduationCap, Soup, Truck, HeartPulse,
  Layers, MessageSquareWarning, MapPin, Building2, ListOrdered,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { navByPath } from '../nav.js';
import { formatNumber, compactNumber, PALETTE } from '../lib/format.js';

import PageHeader from '../components/PageHeader.jsx';
import KpiRow from '../components/KpiRow.jsx';
import Card from '../components/ui/Card.jsx';
import Select from '../components/ui/Select.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import { RiskBadge, Pill } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState, SimulatedTag } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import MahaMap, { MapLegend } from '../components/MahaMap.jsx';
import { Bars, TrendArea } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  hhScore: ShieldAlert, welfare: Layers, dropout: GraduationCap, nutrition: Soup,
  migration: Truck, health: HeartPulse, saturation: GaugeIcon, grievance: MessageSquareWarning,
};

export default function District() {
  const nav = navByPath('/district');
  const { filters, setFilter, options } = useFilters();
  const districtId = filters.district === 'all' ? (options?.districts?.[0]?.id || 'D01') : filters.district;

  const { data, loading, error } = useApi(() => api.district(districtId), [districtId]);
  const [block, setBlock] = useState('all');
  const [village, setVillage] = useState('all');

  const districtOpts = (options?.districts || []).map((d) => ({ value: d.id, label: d.name }));

  const blockOpts = useMemo(() => {
    const b = data?.blocks || [];
    return [{ value: 'all', label: 'All Blocks' }, ...b.map((x) => ({ value: x.id, label: x.name }))];
  }, [data]);
  const villageOpts = useMemo(() => {
    let v = data?.villages || [];
    if (block !== 'all') v = v.filter((x) => x.blockId === block);
    return [{ value: 'all', label: 'All Villages' }, ...v.map((x) => ({ value: x.id, label: x.name }))];
  }, [data, block]);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading district intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { district, kpis, blocks, interventionList, villageClusters, trends } = data;

  // Apply block/village filters to clusters & intervention list
  let clusters = villageClusters;
  let interventions = interventionList;
  if (block !== 'all') {
    const blockName = blocks.find((b) => b.id === block)?.name;
    clusters = clusters.filter((c) => c.block === blockName);
    interventions = interventions.filter((i) => i.block === blockName);
  }
  if (village !== 'all') {
    const vName = (data.villages.find((v) => v.id === village) || {}).name;
    clusters = clusters.filter((c) => c.name === vName);
  }
  if (clusters.length === 0) clusters = villageClusters; // never show an empty map

  const blockCols = [
    { key: 'name', label: 'Block', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'villages', label: 'Villages', align: 'right' },
    { key: 'households', label: 'Households', align: 'right', render: (v) => formatNumber(v) },
    { key: 'riskBand', label: 'Risk', align: 'center', render: (v) => <RiskBadge band={v} /> },
    { key: 'welfareCoverage', label: 'Welfare %', align: 'right', render: (v) => `${v}%` },
    { key: 'dropoutRisk', label: 'Dropout %', align: 'right', render: (v) => `${v}%` },
    { key: 'nutritionRisk', label: 'Nutrition %', align: 'right', render: (v) => `${v}%` },
    { key: 'migrationRisk', label: 'Migration %', align: 'right', render: (v) => `${v}%` },
    { key: 'schemeSaturation', label: 'Saturation %', align: 'right', render: (v) => `${v}%` },
    { key: 'pendingGrievances', label: 'Grievances', align: 'right' },
  ];

  const interventionCols = [
    { key: 'village', label: 'Village', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'block', label: 'Block', className: 'text-ink-500' },
    { key: 'tribalGroup', label: 'Tribal Group', render: (v) => <Pill>{v}</Pill> },
    { key: 'households', label: 'HH', align: 'right' },
    { key: 'score', label: 'Vuln. Score', align: 'right', render: (v) => <span className="font-bold tabular-nums">{v}</span> },
    { key: 'band', label: 'Band', align: 'center', render: (v) => <RiskBadge band={v} /> },
    { key: 'drivers', label: 'Key Drivers', render: (v) => (
      <div className="flex flex-wrap gap-1">{v.map((d) => <Pill key={d} tone="saffron">{d}</Pill>)}</div>
    ), sortable: false },
    { key: 'priority', label: 'Priority', align: 'center', render: (v) => (
      <span className={`chip px-2 py-0.5 text-[11px] font-semibold ${v === 'Immediate' ? 'bg-red-50 text-red-700' : v === 'High' ? 'bg-saffron-50 text-saffron-700' : 'bg-govblue-50 text-govblue-700'}`}>{v}</span>
    ) },
  ];

  return (
    <Shell nav={nav}>
      {/* Selectors */}
      <Card title={`${district.name} — District Profile`} subtitle={`${district.division} Division · Rank #${district.rank} of 12 · ${formatNumber(district.tribalPopulation)} tribal population`} icon={MapPin}
        action={<RiskBadge band={district.riskBand} size="md" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="District" value={districtId} onChange={(v) => { setFilter('district', v); setBlock('all'); setVillage('all'); }} options={districtOpts} />
          <Select label="Block" value={block} onChange={(v) => { setBlock(v); setVillage('all'); }} options={blockOpts} />
          <Select label="Village" value={village} onChange={setVillage} options={villageOpts} />
        </div>
      </Card>

      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Village Vulnerability Clusters (GIS)" subtitle="Bubble size & colour by household vulnerability score" icon={MapPin} className="xl:col-span-2" action={<MapLegend />}>
          <MahaMap points={clusters} height={420} valueLabel="Vulnerability" />
        </Card>
        <div className="space-y-4">
          <Card title="Vulnerability Trend" subtitle="District composite · 12 months" icon={GaugeIcon}>
            <TrendArea data={trends.vulnerability} areas={[{ key: 'value', name: 'Vulnerability', color: PALETTE.saffron }]} height={180} />
          </Card>
          <Card title="Welfare Coverage Trend" subtitle="% beneficiaries reached" icon={Layers}>
            <TrendArea data={trends.welfareCoverage} areas={[{ key: 'value', name: 'Coverage %', color: PALETTE.emerald }]} height={180} valueFmt={(v) => `${v}%`} />
          </Card>
        </div>
      </div>

      <Card title="Village-level Intervention Priority List" subtitle="AI-ranked · highest household vulnerability first" icon={ListOrdered}>
        <DataTable columns={interventionCols} rows={interventions} initialSort={{ key: 'score', dir: 'desc' }} pageSize={8} dense searchKeys={['village', 'block', 'tribalGroup', 'priority']} />
      </Card>

      <Card title="Block Comparison" subtitle={`${blocks.length} blocks · sortable on every metric`} icon={Building2}>
        <DataTable columns={blockCols} rows={blocks} initialSort={{ key: 'riskScore', dir: 'desc' }} dense />
      </Card>

      <ComplianceNote />
    </Shell>
  );
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} right={null} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
