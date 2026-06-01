import {
  FileText, CheckCircle2, Clock, XCircle, BedDouble, Gauge as GaugeIcon,
  UserCheck, Sparkles, GraduationCap, TrendingDown, Building2, Users2,
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
import { LoadingState, ErrorState } from '../components/ui/States.jsx';
import ComplianceNote from '../components/ComplianceNote.jsx';
import { Donut, Bars, TrendLine } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  apps: FileText, approved: CheckCircle2, pending: Clock, rejected: XCircle,
  occupancy: BedDouble, utilization: GaugeIcon, attendance: UserCheck, skill: Sparkles,
};

export default function Education() {
  const nav = navByPath('/education');
  const { queryParams } = useFilters();
  const { data, loading, error } = useApi(() => api.education(queryParams), [JSON.stringify(queryParams)]);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading education & hostel intelligence…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, scholarshipStatus, districtStudents, genderContinuation, hostels, dropoutPrediction } = data;

  const scholarColors = [PALETTE.emerald, PALETTE.amber, PALETTE.red];

  const studentCols = [
    { key: 'district', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'division', label: 'Division', className: 'text-ink-500' },
    { key: 'enrolled', label: 'Enrolled', align: 'right', render: (v) => formatNumber(v) },
    { key: 'attendance', label: 'Attendance %', align: 'right', render: (v) => `${v}%` },
    { key: 'scholarshipApproved', label: 'Sch. Approved', align: 'right', render: (v) => formatNumber(v) },
    { key: 'scholarshipPending', label: 'Sch. Pending', align: 'right', render: (v) => formatNumber(v) },
    { key: 'dropoutRisk', label: 'Dropout Risk %', align: 'right', render: (v) => <RiskCell v={v} /> },
    { key: 'higherEduTransition', label: 'Hr.Edu %', align: 'right', render: (v) => `${v}%` },
  ];

  const hostelCols = [
    { key: 'name', label: 'Hostel', render: (v) => <span className="font-medium text-ink-800">{v}</span> },
    { key: 'district', label: 'District', className: 'text-ink-500' },
    { key: 'type', label: 'Type', align: 'center' },
    { key: 'capacity', label: 'Capacity', align: 'right' },
    { key: 'occupancy', label: 'Occupancy', align: 'right' },
    { key: 'utilization', label: 'Utilization %', align: 'right', render: (v) => `${v}%` },
    { key: 'attendance', label: 'Attendance %', align: 'right', render: (v) => `${v}%` },
    { key: 'mealCompliance', label: 'Meal %', align: 'right', render: (v) => `${v}%` },
    { key: 'infraScore', label: 'Infra Score', align: 'right', render: (v) => <RiskCell v={v} invert /> },
    { key: 'grievances', label: 'Grievances', align: 'right' },
  ];

  const dropoutCols = [
    { key: 'district', label: 'District', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'predictedDropouts', label: 'Predicted Dropouts', align: 'right', render: (v) => formatNumber(v) },
    { key: 'risk', label: 'Risk %', align: 'right', render: (v) => <RiskCell v={v} /> },
    { key: 'confidence', label: 'Model Confidence', align: 'right', render: (v) => <span className="chip px-2 py-0.5 text-[11px] bg-govblue-50 text-govblue-700">{v}%</span> },
  ];

  return (
    <Shell nav={nav}>
      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Scholarship Status Mix" subtitle="Approved · Pending · Rejected" icon={GraduationCap}>
          <Donut data={scholarshipStatus} nameKey="status" colors={scholarColors} centerLabel={{ label: 'Total Apps' }} />
        </Card>
        <Card title="Gender-wise Education Continuation" subtitle="% continuing at each stage" icon={Users2} className="lg:col-span-2">
          <Bars data={genderContinuation} xKey="stage" bars={[
            { key: 'boys', name: 'Boys', color: PALETTE.blue },
            { key: 'girls', name: 'Girls', color: PALETTE.saffron },
          ]} height={260} valueFmt={(v) => `${v}%`} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Dropout Risk Prediction" subtitle="AI-predicted dropouts by district (top 10)" icon={TrendingDown}>
          <DataTable columns={dropoutCols} rows={dropoutPrediction} initialSort={{ key: 'predictedDropouts', dir: 'desc' }} dense searchable={false} />
        </Card>
        <Card title="District-wise Tribal Student Dashboard" subtitle="Enrolment, attendance & scholarship status" icon={UserCheck}>
          <DataTable columns={studentCols} rows={districtStudents} initialSort={{ key: 'dropoutRisk', dir: 'desc' }} pageSize={8} dense />
        </Card>
      </div>

      <Card title="Hostel Performance" subtitle={`${hostels.length} tribal hostels & ashram shalas · capacity utilization, attendance, infra`} icon={Building2}>
        <DataTable columns={hostelCols} rows={hostels} initialSort={{ key: 'utilization', dir: 'desc' }} pageSize={10} dense />
      </Card>

      <ComplianceNote />
    </Shell>
  );
}

function RiskCell({ v, invert = false }) {
  // invert=true means higher is better (e.g. infra score)
  const bad = invert ? v < 55 : v > 25;
  const warn = invert ? v < 70 : v > 15;
  const color = bad ? 'text-red-600' : warn ? 'text-saffron-600' : 'text-emerald-600';
  return <span className={`font-semibold tabular-nums ${color}`}>{v}{invert ? '' : '%'}</span>;
}

function Shell({ nav, children }) {
  return (
    <>
      <PageHeader nav={nav} />
      <FilterBar show={['district', 'division', 'gender', 'age', 'scheme', 'status', 'date']} />
      <div className="mt-4 space-y-4">{children}</div>
    </>
  );
}
