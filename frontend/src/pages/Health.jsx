import {
  HeartPulse, Baby, Droplets, Hospital, Syringe, AlertOctagon,
  Footprints, Gauge as GaugeIcon, Soup, MapPin, Activity, Stethoscope,
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
import { RiskBadge, Pill } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import MahaMap, { MapLegend } from '../components/MahaMap.jsx';
import { Bars, TrendLine, ComboChart } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  maternal: HeartPulse, malnutrition: Baby, anemia: Droplets, phc: Hospital,
  immunization: Syringe, highrisk: AlertOctagon, visits: Footprints, hvi: GaugeIcon,
};

export default function Health() {
  const nav = navByPath('/health');
  const { queryParams } = useFilters();
  const { data, loading, error } = useApi(() => api.health(queryParams), [JSON.stringify(queryParams)]);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading nutrition & health vulnerability intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, malnutritionByDistrict, seasonalDisease, highRiskVillages, interventionMap, healthWorkerTracking } = data;

  const malCols = [
    { key: 'district', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'sam', label: 'SAM Children', align: 'right', render: (v) => <span className="font-semibold text-red-600">{formatNumber(v)}</span> },
    { key: 'mam', label: 'MAM Children', align: 'right', render: (v) => formatNumber(v) },
    { key: 'anemia', label: 'Anemia %', align: 'right', render: (v) => `${v}%` },
    { key: 'immunization', label: 'Immunization %', align: 'right', render: (v) => `${v}%` },
    { key: 'vulnerabilityIndex', label: 'Health Vuln. Index', align: 'right', render: (v) => <IndexCell v={v} /> },
  ];

  const villageCols = [
    { key: 'village', label: 'Village', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'block', label: 'Block', className: 'text-ink-500' },
    { key: 'district', label: 'District', className: 'text-ink-500' },
    { key: 'nutritionRisk', label: 'Nutrition Risk %', align: 'right', render: (v) => <IndexCell v={v} /> },
    { key: 'healthGap', label: 'Health Gap %', align: 'right', render: (v) => `${v}%` },
    { key: 'phcDistanceKm', label: 'PHC Dist (km)', align: 'right', render: (v) => `${v}` },
    { key: 'band', label: 'Band', align: 'center', render: (v) => <RiskBadge band={v} /> },
    { key: 'intervention', label: 'Recommended', render: (v) => <Pill tone="saffron">{v}</Pill>, sortable: false },
  ];

  const hwCols = [
    { key: 'district', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'asha', label: 'ASHA', align: 'right', render: (v) => formatNumber(v) },
    { key: 'anm', label: 'ANM', align: 'right' },
    { key: 'visitsPlanned', label: 'Visits Planned', align: 'right', render: (v) => formatNumber(v) },
    { key: 'visitsDone', label: 'Visits Done', align: 'right', render: (v) => formatNumber(v) },
    { key: 'compliance', label: 'Compliance %', align: 'right', render: (v) => <IndexCell v={v} invert /> },
  ];

  return (
    <Shell nav={nav}>
      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Nutrition Intervention Priority Map" subtitle="Village nutrition-risk clusters" icon={MapPin} className="xl:col-span-2" action={<MapLegend />}>
          <MahaMap points={interventionMap} height={420} valueLabel="Nutrition Risk" />
        </Card>
        <Card title="Seasonal Disease Trends" subtitle="Tribal belt · case counts" icon={Activity}>
          <TrendLine data={seasonalDisease} height={420} lines={[
            { key: 'malaria', name: 'Malaria', color: PALETTE.red },
            { key: 'gastro', name: 'Gastro', color: PALETTE.amber },
            { key: 'respiratory', name: 'Respiratory', color: PALETTE.blue },
            { key: 'sickleCell', name: 'Sickle Cell', color: PALETTE.violet },
          ]} />
        </Card>
      </div>

      <Card title="District Health Vulnerability Index" subtitle="SAM/MAM burden & composite index" icon={Stethoscope}>
        <Bars data={malnutritionByDistrict} xKey="district" bars={[
          { key: 'sam', name: 'SAM', color: PALETTE.red },
          { key: 'vulnerabilityIndex', name: 'Vuln. Index', color: PALETTE.blue },
        ]} height={280} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="High-Risk Villages" subtitle="Highest nutrition risk · intervention required" icon={AlertOctagon}>
          <DataTable columns={villageCols} rows={highRiskVillages} initialSort={{ key: 'nutritionRisk', dir: 'desc' }} pageSize={8} dense />
        </Card>
        <Card title="Malnutrition & Health Burden Table" subtitle="District-wise SAM/MAM, anemia, immunization" icon={Soup}>
          <DataTable columns={malCols} rows={malnutritionByDistrict} initialSort={{ key: 'vulnerabilityIndex', dir: 'desc' }} pageSize={8} dense />
        </Card>
      </div>

      <Card title="Health Worker Visit Tracking" subtitle="ASHA/ANM field visit compliance" icon={Footprints}>
        <DataTable columns={hwCols} rows={healthWorkerTracking} initialSort={{ key: 'compliance', dir: 'asc' }} dense />
      </Card>

      <ComplianceNote />
    </Shell>
  );
}

function IndexCell({ v, invert = false }) {
  const bad = invert ? v < 75 : v > 40;
  const warn = invert ? v < 88 : v > 28;
  const color = bad ? 'text-red-600' : warn ? 'text-saffron-600' : 'text-emerald-600';
  return <span className={`font-semibold tabular-nums ${color}`}>{v}{invert || v > 100 ? '' : ''}</span>;
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <FilterBar show={['district', 'division', 'gender', 'age', 'vulnerability', 'date']} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
