import {
  Home, Truck, HardHat, Users, Trees, Sparkles, Gauge as GaugeIcon,
  AlertTriangle, MapPin, Route, IndianRupee, ArrowRightLeft,
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
import { Pill } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import MahaMap, { MapLegend } from '../components/MahaMap.jsx';
import { ComboChart, Bars } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  households: Home, migrating: Truck, mgnrega: HardHat, shg: Users,
  vandhan: Trees, skill: Sparkles, stress: GaugeIcon, income: AlertTriangle,
};

export default function Migration() {
  const nav = navByPath('/migration');
  const { queryParams } = useFilters();
  const { data, loading, error } = useApi(() => api.migration(queryParams), [JSON.stringify(queryParams)]);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading migration & livelihood intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, migrationHeatmap, sourceVillages, corridors, livelihoodTable, livelihoodTrend } = data;

  const sourceCols = [
    { key: 'village', label: 'Source Village', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'block', label: 'Block', className: 'text-ink-500' },
    { key: 'district', label: 'District', className: 'text-ink-500' },
    { key: 'tribalGroup', label: 'Tribal Group', render: (v) => <Pill>{v}</Pill> },
    { key: 'migratingHouseholds', label: 'Migrating HH', align: 'right', render: (v) => formatNumber(v) },
    { key: 'migrationRisk', label: 'Migration Risk %', align: 'right', render: (v) => <span className="font-semibold text-saffron-600 tabular-nums">{v}%</span> },
    { key: 'destination', label: 'Primary Destination', render: (v) => <Pill tone="saffron">{v}</Pill>, sortable: false },
  ];

  const corridorCols = [
    { key: 'from', label: 'Source', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'to', label: 'Destination Corridor', render: (v) => <span className="inline-flex items-center gap-1.5"><ArrowRightLeft size={13} className="text-ink-300" />{v}</span> },
    { key: 'volume', label: 'Volume', align: 'right', render: (v) => formatNumber(v) },
    { key: 'distanceKm', label: 'Distance', align: 'right', render: (v) => `${v} km` },
    { key: 'stress', label: 'Stress Score', align: 'right', render: (v) => <StressCell v={v} /> },
  ];

  const livelihoodCols = [
    { key: 'district', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'division', label: 'Division', className: 'text-ink-500' },
    { key: 'mgnregaDays', label: 'MGNREGA Days', align: 'right' },
    { key: 'shgGroups', label: 'SHG Groups', align: 'right', render: (v) => formatNumber(v) },
    { key: 'vandhanKendras', label: 'Van Dhan Kendras', align: 'right' },
    { key: 'avgIncomeMonthly', label: 'Avg Income', align: 'right', render: (v) => `₹${formatNumber(v)}` },
    { key: 'migrationRisk', label: 'Migration %', align: 'right', render: (v) => `${v}%` },
    { key: 'stressScore', label: 'Livelihood Stress', align: 'right', render: (v) => <StressCell v={v} /> },
  ];

  return (
    <Shell nav={nav}>
      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Seasonal Migration Heatmap" subtitle="Village out-migration intensity" icon={MapPin} className="xl:col-span-2" action={<MapLegend />}>
          <MahaMap points={migrationHeatmap} height={420} valueLabel="Migration Risk" />
        </Card>
        <Card title="MGNREGA Demand vs Migration" subtitle="Monthly stress signals" icon={HardHat}>
          <ComboChart data={livelihoodTrend} height={420}
            bars={[{ key: 'mgnregaDemand', name: 'MGNREGA Demand', color: PALETTE.blue }, { key: 'mfpCollection', name: 'MFP Collection', color: PALETTE.emerald }]}
            lines={[{ key: 'migration', name: 'Migration', color: PALETTE.saffron }]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Migration Source Villages" subtitle="Highest out-migration risk" icon={Truck}>
          <DataTable columns={sourceCols} rows={sourceVillages} initialSort={{ key: 'migrationRisk', dir: 'desc' }} pageSize={8} dense />
        </Card>
        <Card title="Destination Corridors" subtitle="Inter-state & intra-state seasonal corridors" icon={Route}>
          <Bars data={corridors} xKey="from" layout="vertical" bars={[{ key: 'volume', name: 'Migrant Volume', color: PALETTE.saffron }]} height={260} />
          <div className="mt-3"><DataTable columns={corridorCols} rows={corridors} searchable={false} dense /></div>
        </Card>
      </div>

      <Card title="Household Livelihood-Risk Table" subtitle="District livelihood stress, MGNREGA, SHG & income" icon={IndianRupee}>
        <DataTable columns={livelihoodCols} rows={livelihoodTable} initialSort={{ key: 'stressScore', dir: 'desc' }} dense />
      </Card>

      <ComplianceNote />
    </Shell>
  );
}

function StressCell({ v }) {
  const color = v > 65 ? 'text-red-600' : v > 50 ? 'text-saffron-600' : 'text-emerald-600';
  return <span className={`font-semibold tabular-nums ${color}`}>{v}</span>;
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <FilterBar show={['district', 'division', 'tribal', 'vulnerability', 'date']} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
