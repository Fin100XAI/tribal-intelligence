import {
  UserCheck, Gauge as GaugeIcon, Scale, ShieldCheck, Lock, ScrollText,
  Database, AlertTriangle, CheckCircle2, Clock, Brain, KeyRound, Server,
} from 'lucide-react';
import { useApi } from '../hooks/useApi.js';
import { api } from '../api/client.js';
import { navByPath } from '../nav.js';
import { formatNumber, PALETTE, relativeTime } from '../lib/format.js';

import PageHeader from '../components/PageHeader.jsx';
import KpiRow from '../components/KpiRow.jsx';
import Card from '../components/ui/Card.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import { StatusBadge, Pill } from '../components/ui/Badge.jsx';
import { LoadingState, ErrorState, SimulatedTag } from '../components/ui/States.jsx';
import AlertBanner from '../components/ui/AlertBanner.jsx';
import { Bars, Gauge } from '../components/charts/Charts.jsx';

const KPI_ICONS = {
  hitl: UserCheck, confidence: GaugeIcon, bias: Scale, dpdp: ShieldCheck,
  cyber: Lock, audit: ScrollText, minimization: Database, incidents: AlertTriangle,
};

export default function Compliance() {
  const nav = navByPath('/compliance');
  const { data, loading, error } = useApi(() => api.compliance(), []);

  if (loading) return <Shell nav={nav}><LoadingState label="Loading responsible AI & compliance posture…" /></Shell>;
  if (error) return <Shell nav={nav}><ErrorState error={error} /></Shell>;

  const { kpis, dpdpChecklist, rbac, auditLogs, biasMonitoring, explainability, incidents } = data;

  const auditCols = [
    { key: 'timestamp', label: 'Time', render: (v) => <span className="text-ink-500">{relativeTime(v)}</span> },
    { key: 'actor', label: 'Actor', render: (v) => <span className="font-medium text-ink-800">{v}</span> },
    { key: 'action', label: 'Action' },
    { key: 'module', label: 'Module', render: (v) => <Pill>{v}</Pill> },
    { key: 'decision', label: 'Decision', align: 'center', render: (v) => (
      <span className={`chip px-2 py-0.5 text-[11px] font-semibold ${v === 'Overridden' ? 'bg-saffron-50 text-saffron-700' : v === 'Escalated' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{v}</span>
    ) },
    { key: 'confidence', label: 'Confidence', align: 'right', render: (v) => `${v}%` },
  ];

  const rbacCols = [
    { key: 'role', label: 'Role', render: (v) => <span className="font-semibold text-ink-800">{v}</span> },
    { key: 'access', label: 'Access Rights' },
    { key: 'scope', label: 'Scope', align: 'center', render: (v) => <Pill tone="blue">{v}</Pill> },
    { key: 'users', label: 'Users', align: 'right' },
  ];

  const incidentCols = [
    { key: 'id', label: 'Incident', render: (v) => <span className="font-mono text-xs font-semibold text-ink-700">{v}</span> },
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity', align: 'center', render: (v) => (
      <span className={`chip px-2 py-0.5 text-[11px] font-semibold ${v === 'High' ? 'bg-red-50 text-red-700' : v === 'Medium' ? 'bg-saffron-50 text-saffron-700' : 'bg-govblue-50 text-govblue-700'}`}>{v}</span>
    ) },
    { key: 'status', label: 'Status', align: 'center', render: (v) => <StatusBadge status={v} /> },
    { key: 'certIn', label: 'CERT-In', align: 'center', render: (v) => <span className="text-xs text-ink-500">{v}</span> },
    { key: 'date', label: 'Date', align: 'right', className: 'text-ink-500' },
  ];

  return (
    <Shell nav={nav}>
      <AlertBanner variant="compliance" title="Human-in-the-Loop is enforced platform-wide">
        Every AI recommendation in this platform is routed through an authorized officer for review before any action.
        AI outputs are decision-support indicators only. 100% of outputs are logged for audit.
      </AlertBanner>

      <KpiRow kpis={kpis} icons={KPI_ICONS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Model Confidence" subtitle="Avg across active models" icon={GaugeIcon}>
          <Gauge value={kpis.find((k) => k.key === 'confidence').value} label="Confidence %" color={PALETTE.blue} height={200} />
        </Card>
        <Card title="Explainability Panel" subtitle="Why the model recommended this" icon={Brain} className="lg:col-span-2">
          <div className="rounded-xl bg-govblue-50/60 border border-govblue-100 px-3 py-2.5 mb-3">
            <p className="text-[13px] font-medium text-ink-800">“{explainability.sampleRecommendation}”</p>
            <p className="mt-1 text-xs text-govblue-700">Model confidence: <span className="font-semibold">{explainability.confidence}%</span></p>
          </div>
          <div className="space-y-2">
            {explainability.drivers.map((d) => (
              <div key={d.factor}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-600">{d.factor}</span>
                  <span className="font-semibold tabular-nums text-ink-800">{(d.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-govblue-600" style={{ width: `${d.weight * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Bias Monitoring" subtitle="Fairness scores across protected dimensions" icon={Scale}>
          <Bars data={biasMonitoring} xKey="dimension" layout="vertical" bars={[{ key: 'score', name: 'Fairness Score', color: PALETTE.emerald }]} height={220} valueFmt={(v) => `${v}%`} />
        </Card>
        <Card title="DPDP Compliance Checklist" subtitle="Digital Personal Data Protection Act readiness" icon={ShieldCheck}>
          <ul className="space-y-2">
            {dpdpChecklist.map((c) => (
              <li key={c.item} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-3 py-2">
                <span className="flex items-center gap-2 text-[13px] text-ink-700">
                  {c.status === 'Compliant' ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> : <Clock size={15} className="text-amber-500 shrink-0" />}
                  {c.item}
                </span>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Role-Based Access Control (RBAC)" subtitle="Data minimization & purpose limitation enforced" icon={KeyRound}>
          <DataTable columns={rbacCols} rows={rbac} searchable={false} dense />
        </Card>
        <Card title="CERT-In Aligned Incident Panel" subtitle="Cybersecurity incidents & reporting status" icon={Server}>
          <DataTable columns={incidentCols} rows={incidents} searchable={false} dense />
        </Card>
      </div>

      <Card title="AI Recommendation Audit Logs" subtitle="Immutable log of human review decisions" icon={ScrollText} action={<SimulatedTag />}>
        <DataTable columns={auditCols} rows={auditLogs} initialSort={{ key: 'timestamp', dir: 'desc' }} pageSize={8} dense searchKeys={['actor', 'action', 'module', 'decision']} />
      </Card>
    </Shell>
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
