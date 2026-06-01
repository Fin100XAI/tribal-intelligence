// ---------------------------------------------------------------------------
// Builders — assemble per-endpoint payloads from the seeded DATA model.
// All values "Simulated for PoC".
// ---------------------------------------------------------------------------
import { DATA, SCHEMES, DEPARTMENTS, helpers } from './seed.js';

const { rand, randInt, pick, round, series, sum, MONTHS } = helpers;

// Apply district / division filters to a district list -----------------------
// Never returns an empty list: filters are relaxed step-by-step so the
// dashboard always has data (design rule #4 — no blank / zero cards).
export function filterDistricts(query = {}) {
  const base = [...DATA.districts];
  const byGeo = (arr) => {
    let r = arr;
    if (query.district && query.district !== 'all') r = r.filter((d) => d.id === query.district || d.name === query.district);
    if (query.division && query.division !== 'all') r = r.filter((d) => d.division === query.division);
    return r;
  };
  let ds = byGeo(base);
  if (query.risk && query.risk !== 'all') {
    const withRisk = ds.filter((d) => d.riskBand === query.risk);
    if (withRisk.length) ds = withRisk; // keep geo subset if risk empties it
  }
  return ds.length ? ds : base;
}

// Deterministic 0.6–1.0 factor derived from the non-geographic filters
// (department, scheme, gender, age, tribal group, vulnerability, status, dates).
// Changing ANY of these visibly shifts the numbers, so every filter "works".
export function filterScale(query = {}) {
  const keys = ['department', 'scheme', 'gender', 'age', 'tribal', 'vulnerability', 'status', 'from', 'to'];
  let h = 7;
  for (const k of keys) {
    const v = query[k];
    if (v && v !== 'all' && v !== 'All') {
      for (let i = 0; i < String(v).length; i++) h = (Math.imul(h, 31) + String(v).charCodeAt(i)) >>> 0;
    }
  }
  if (h === 7) return 1; // no extra filters → full dataset
  return round(0.6 + ((h % 1000) / 1000) * 0.4, 3);
}

// Scale the volume-type KPI values (number / crore) by the filter factor so
// KPI cards respond to every filter without breaking derived percentages.
export function scaleKpis(kpis = [], factor = 1) {
  if (factor === 1) return kpis;
  return kpis.map((k) =>
    k.format === 'number' || k.format === 'crore'
      ? { ...k, value: k.format === 'crore' ? round(k.value * factor, 1) : Math.max(1, Math.round(k.value * factor)) }
      : k,
  );
}

// ---------------------------------------------------------------------------
// 1. OVERVIEW (Executive Command)
// ---------------------------------------------------------------------------
export function buildOverview(query = {}) {
  const ds = filterDistricts(query);
  const t = DATA.totals;
  const highRisk = ds.filter((d) => d.riskBand === 'Critical' || d.riskBand === 'High');

  const kpis = [
    { key: 'population', label: 'Tribal Population Covered', value: sum(ds, (d) => d.tribalPopulation), format: 'number', trend: +2.4, sub: `${ds.length} districts` },
    { key: 'schemes', label: 'Schemes Monitored', value: SCHEMES.length, format: 'number', trend: +4.0, sub: 'Live convergence' },
    { key: 'beneficiaries', label: 'Total Beneficiaries', value: sum(ds, (d) => d.beneficiaries), format: 'number', trend: +3.1, sub: 'MahaDBT linked' },
    { key: 'expenditure', label: 'Welfare Expenditure Monitored', value: round(sum(ds, (d) => d.expenditureCr), 1), format: 'crore', trend: +6.8, sub: `of ₹${round(sum(ds, (d) => d.allocationCr), 0)} Cr allocated` },
    { key: 'tdi', label: 'Avg. Tribal Development Index', value: round(sum(ds, (d) => d.tdi) / ds.length, 1), format: 'index', trend: +1.2, sub: 'State composite' },
    { key: 'highrisk', label: 'High-Risk Districts', value: highRisk.length, format: 'number', trend: -1.0, sub: 'Critical + High', tone: 'danger' },
    { key: 'dbt', label: 'DBT Failure Alerts', value: sum(ds, (d) => d.dbtFailures), format: 'number', trend: -8.4, sub: 'Open this cycle', tone: 'warning' },
    { key: 'scholarship', label: 'Scholarship Pending Cases', value: sum(ds, (d) => d.scholarshipPending), format: 'number', trend: -4.7, sub: 'Post + Pre matric', tone: 'warning' },
    { key: 'nutrition', label: 'Nutrition Vulnerability Clusters', value: sum(ds, (d) => d.nutritionClusters), format: 'number', trend: -2.1, sub: 'Across villages', tone: 'warning' },
    { key: 'migration', label: 'Migration Risk Clusters', value: sum(ds, (d) => d.migrationClusters), format: 'number', trend: +3.3, sub: 'Seasonal corridors', tone: 'warning' },
    { key: 'fra', label: 'FRA Claim Backlog', value: sum(ds, (d) => d.fraBacklog), format: 'number', trend: -5.5, sub: 'Pending titles', tone: 'warning' },
    { key: 'grievance', label: 'Grievance Escalations', value: sum(ds, (d) => d.grievancesOpen), format: 'number', trend: -3.0, sub: 'Open + escalated', tone: 'warning' },
  ];

  const ranking = ds
    .map((d) => ({
      id: d.id, name: d.name, division: d.division, tdi: d.tdi, rank: d.rank,
      riskScore: d.riskScore, riskBand: d.riskBand, welfareCoverage: d.welfareCoverage,
      beneficiaries: d.beneficiaries, expenditureCr: d.expenditureCr, utilizationPct: d.utilizationPct,
      dbtFailures: d.dbtFailures, fraBacklog: d.fraBacklog,
    }))
    .sort((a, b) => a.rank - b.rank);

  const heatmap = ds.map((d) => ({
    id: d.id, name: d.name, lat: d.lat, lng: d.lng, riskScore: d.riskScore,
    riskBand: d.riskBand, tdi: d.tdi, tribalPopulation: d.tribalPopulation,
    beneficiaries: d.beneficiaries, division: d.division,
  }));

  const alertTemplates = [
    { type: 'DBT', sev: 'Critical', msg: (n) => `Spike in MahaDBT transfer failures in ${n} — Aadhaar/bank mismatch flagged` },
    { type: 'Nutrition', sev: 'Critical', msg: (n) => `${n}: SAM child cluster crossed threshold — Amrut Aahar escalation advised` },
    { type: 'Scholarship', sev: 'High', msg: (n) => `Post-matric scholarship backlog ageing >45 days in ${n}` },
    { type: 'FRA', sev: 'High', msg: (n) => `FRA individual claims pending verification beyond SLA in ${n}` },
    { type: 'Migration', sev: 'High', msg: (n) => `Seasonal out-migration surge detected from ${n} tribal belt` },
    { type: 'Grievance', sev: 'Moderate', msg: (n) => `Grievance resolution time deteriorating in ${n}` },
    { type: 'Health', sev: 'High', msg: (n) => `Immunization coverage dip in interior villages of ${n}` },
  ];
  const sorted = [...ds].sort((a, b) => b.riskScore - a.riskScore);
  const alerts = sorted.slice(0, 8).map((d, i) => {
    const tpl = alertTemplates[i % alertTemplates.length];
    return {
      id: `ALT-${1000 + i}`, type: tpl.type, severity: tpl.sev, district: d.name,
      division: d.division, message: tpl.msg(d.name),
      raisedAt: new Date(Date.now() - randInt(1, 72) * 3600 * 1000).toISOString(),
      owner: pick(['District Collector', 'Project Officer ITDP', 'CEO Zilla Parishad', 'Dy. Director Tribal']),
      status: pick(['New', 'Acknowledged', 'In Action']),
    };
  });

  const trends = {
    welfareExpenditure: series(round(totalAvg(ds, 'expenditureCr') * 0.7, 1), 6, 1.5),
    dbtFailures: series(randInt(800, 1400), 120, -20),
    grievanceResolutionDays: series(rand(9, 14), 1.2, -0.2),
    riskIndex: series(rand(48, 56), 2.5, -0.4),
  };

  const tdiByDivision = DATA.divisions.map((div) => {
    const list = ds.filter((d) => d.division === div);
    return {
      division: div,
      tdi: list.length ? round(sum(list, (d) => d.tdi) / list.length, 1) : 0,
      risk: list.length ? round(sum(list, (d) => d.riskScore) / list.length, 1) : 0,
      districts: list.length,
    };
  }).filter((x) => x.districts > 0);

  return { meta: DATA.meta, kpis, ranking, heatmap, alerts, trends, tdiByDivision };
}
function totalAvg(arr, key) { return arr.length ? sum(arr, (d) => d[key]) / arr.length : 0; }

// ---------------------------------------------------------------------------
// 2. DISTRICTS list + 2b. DISTRICT detail
// ---------------------------------------------------------------------------
export function buildDistricts(query = {}) {
  const ds = filterDistricts(query);
  return { meta: DATA.meta, count: ds.length, districts: ds };
}

export function buildDistrictDetail(id) {
  const d = DATA.districts.find((x) => x.id === id || x.name === id);
  if (!d) return null;
  const dBlocks = DATA.blocks.filter((b) => b.districtId === d.id);
  const dVillages = DATA.villages.filter((v) => v.districtId === d.id);

  const kpis = [
    { key: 'hhScore', label: 'Avg Household Vulnerability', value: round(sum(dVillages, (v) => v.vulnerabilityScore) / Math.max(1, dVillages.length), 1), format: 'index', tone: 'danger' },
    { key: 'welfare', label: 'Welfare Coverage', value: d.welfareCoverage, format: 'percent', trend: +2.0 },
    { key: 'dropout', label: 'Dropout Risk', value: d.dropoutRisk, format: 'percent', tone: 'warning', trend: -1.4 },
    { key: 'nutrition', label: 'Nutrition Risk', value: d.nutritionRisk, format: 'percent', tone: 'warning', trend: -0.8 },
    { key: 'migration', label: 'Migration Vulnerability', value: d.migrationRisk, format: 'percent', tone: 'warning', trend: +1.1 },
    { key: 'health', label: 'Health Access Gap', value: round(sum(dBlocks, (b) => b.healthAccessGap) / Math.max(1, dBlocks.length), 1), format: 'percent', tone: 'warning' },
    { key: 'saturation', label: 'Scheme Saturation', value: round(sum(dBlocks, (b) => b.schemeSaturation) / Math.max(1, dBlocks.length), 1), format: 'percent', trend: +3.2 },
    { key: 'grievance', label: 'Pending Grievances', value: d.grievancesOpen, format: 'number', tone: 'warning' },
  ];

  const interventionList = [...dVillages]
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
    .slice(0, 12)
    .map((v) => ({
      village: v.name, block: v.blockName, score: v.vulnerabilityScore, band: v.riskBand,
      priority: v.interventionPriority, households: v.households, tribalGroup: v.tribalGroup,
      drivers: topDrivers(v),
    }));

  const villageClusters = dVillages.map((v) => ({
    id: v.id, name: v.name, block: v.blockName, lat: v.lat, lng: v.lng,
    score: v.vulnerabilityScore, band: v.riskBand, households: v.households, priority: v.interventionPriority,
  }));

  return {
    meta: DATA.meta,
    district: d,
    kpis,
    blocks: dBlocks,
    villages: dVillages,
    interventionList,
    villageClusters,
    trends: {
      vulnerability: series(d.riskScore * 0.9, 3, -0.4),
      welfareCoverage: series(d.welfareCoverage * 0.9, 2.5, 0.6),
    },
  };
}
function topDrivers(v) {
  const arr = [
    { k: 'Dropout', val: v.dropoutRisk }, { k: 'Nutrition', val: v.nutritionRisk },
    { k: 'Migration', val: v.migrationRisk }, { k: 'Health Gap', val: v.healthAccessGap },
  ].sort((a, b) => b.val - a.val);
  return arr.slice(0, 2).map((x) => x.k);
}

// ---------------------------------------------------------------------------
// 3. WELFARE ASSURANCE
// ---------------------------------------------------------------------------
export function buildWelfare(query = {}) {
  const ds = filterDistricts(query);
  const totalBen = sum(ds, (d) => d.beneficiaries);
  const eligible = Math.round(totalBen * rand(1.15, 1.35));
  const applied = Math.round(eligible * rand(0.78, 0.9));
  const approved = Math.round(applied * rand(0.74, 0.88));
  const received = Math.round(approved * rand(0.82, 0.94));

  const funnel = [
    { stage: 'Eligible', value: eligible },
    { stage: 'Applied', value: applied },
    { stage: 'Approved', value: approved },
    { stage: 'Benefit Received', value: received },
  ];

  const dbtLinkage = {
    aadhaarSeeded: round(rand(88, 97), 1),
    bankLinked: round(rand(82, 95), 1),
    mahaDbtMapped: round(rand(79, 93), 1),
    aadhaarIssues: sum(ds, (d) => d.dbtFailures) - randInt(200, 800),
    bankFailures: randInt(3200, 9800),
    pendingApprovals: sum(ds, (d) => d.scholarshipPending) + randInt(2000, 6000),
  };

  const kpis = [
    { key: 'eligible', label: 'Eligible Beneficiaries', value: eligible, format: 'number' },
    { key: 'applied', label: 'Applications Received', value: applied, format: 'number', trend: +4.2 },
    { key: 'approved', label: 'Approved', value: approved, format: 'number', trend: +3.1 },
    { key: 'received', label: 'Benefit Delivered', value: received, format: 'number', trend: +5.0 },
    { key: 'aadhaar', label: 'Aadhaar Seeding Issues', value: dbtLinkage.aadhaarIssues, format: 'number', tone: 'warning', trend: -6.1 },
    { key: 'bank', label: 'Bank Account Failures', value: dbtLinkage.bankFailures, format: 'number', tone: 'danger', trend: -2.3 },
    { key: 'pending', label: 'Pending Approvals', value: dbtLinkage.pendingApprovals, format: 'number', tone: 'warning', trend: -3.4 },
    { key: 'anomaly', label: 'Duplicate / Anomaly Flags', value: randInt(420, 1800), format: 'number', tone: 'danger', trend: -1.0 },
  ];

  const schemeCoverage = SCHEMES.map((s) => {
    const target = randInt(8000, 120000);
    const covered = Math.round(target * rand(0.41, 0.96));
    return {
      id: s.id, scheme: s.name, dept: s.dept, category: s.category,
      target, covered, coveragePct: round((covered / target) * 100, 1),
      expenditureCr: round(rand(2, 84), 1), pending: randInt(40, 4200),
      delayDays: randInt(2, 38),
    };
  }).sort((a, b) => a.coveragePct - b.coveragePct);

  const deptBottlenecks = DEPARTMENTS.map((dep) => ({
    dept: dep,
    pending: randInt(800, 9200),
    avgDelayDays: randInt(4, 41),
    slaBreaches: randInt(20, 380),
    throughput: round(rand(62, 96), 1),
  })).sort((a, b) => b.avgDelayDays - a.avgDelayDays);

  const rejectionReasons = [
    { reason: 'Aadhaar–bank name mismatch', count: randInt(1800, 5200), share: 0 },
    { reason: 'Income certificate invalid/expired', count: randInt(1200, 3800), share: 0 },
    { reason: 'Caste validity pending', count: randInt(900, 3200), share: 0 },
    { reason: 'Duplicate application detected', count: randInt(400, 1600), share: 0 },
    { reason: 'Incomplete documents', count: randInt(1500, 4200), share: 0 },
    { reason: 'Bank account inactive/frozen', count: randInt(600, 2100), share: 0 },
  ];
  const rejTotal = sum(rejectionReasons, (r) => r.count);
  rejectionReasons.forEach((r) => { r.share = round((r.count / rejTotal) * 100, 1); });

  const deliveryDelay = MONTHS.map((m) => ({
    month: m, onTime: round(rand(58, 84), 1), delayed: round(rand(10, 28), 1), failed: round(rand(2, 10), 1),
  }));

  return {
    meta: DATA.meta, kpis, funnel, dbtLinkage, schemeCoverage,
    deptBottlenecks, rejectionReasons: rejectionReasons.sort((a, b) => b.count - a.count), deliveryDelay,
  };
}

// ---------------------------------------------------------------------------
// 4. EDUCATION / SCHOLARSHIP / HOSTEL
// ---------------------------------------------------------------------------
export function buildEducation(query = {}) {
  const ds = filterDistricts(query);
  const applications = sum(ds, (d) => d.scholarshipPending) + randInt(40000, 90000);
  const approved = Math.round(applications * rand(0.6, 0.74));
  const pending = sum(ds, (d) => d.scholarshipPending);
  const rejected = applications - approved - pending;

  const kpis = [
    { key: 'apps', label: 'Scholarship Applications', value: applications, format: 'number', trend: +5.1 },
    { key: 'approved', label: 'Approved Scholarships', value: approved, format: 'number', trend: +4.4 },
    { key: 'pending', label: 'Pending Scholarships', value: pending, format: 'number', tone: 'warning', trend: -3.8 },
    { key: 'rejected', label: 'Rejected Scholarships', value: Math.max(0, rejected), format: 'number', tone: 'danger', trend: -1.1 },
    { key: 'occupancy', label: 'Hostel Occupancy', value: randInt(48000, 86000), format: 'number', trend: +2.2 },
    { key: 'utilization', label: 'Hostel Capacity Utilization', value: round(rand(72, 94), 1), format: 'percent', trend: +1.3 },
    { key: 'attendance', label: 'Student Attendance', value: round(rand(74, 92), 1), format: 'percent', trend: +0.9 },
    { key: 'skill', label: 'Skill-Readiness Score', value: round(rand(52, 74), 1), format: 'index', trend: +3.0 },
  ];

  const scholarshipStatus = [
    { status: 'Approved', value: approved },
    { status: 'Pending', value: pending },
    { status: 'Rejected', value: Math.max(0, rejected) },
  ];

  const districtStudents = ds.map((d) => ({
    id: d.id, district: d.name, division: d.division,
    enrolled: randInt(8000, 48000),
    dropoutRisk: d.dropoutRisk,
    attendance: round(rand(70, 93), 1),
    scholarshipApproved: randInt(4000, 22000),
    scholarshipPending: d.scholarshipPending,
    higherEduTransition: round(rand(18, 46), 1),
  })).sort((a, b) => b.dropoutRisk - a.dropoutRisk);

  const genderContinuation = MONTHS.filter((_, i) => i % 2 === 0).map((m, i) => ({
    stage: ['Primary', 'Upper Primary', 'Secondary', 'Hr. Secondary', 'Graduation', 'Post-Grad'][i],
    boys: round(100 - i * rand(8, 14), 1),
    girls: round(100 - i * rand(11, 18), 1),
  }));

  const hostels = [];
  ds.forEach((d) => {
    for (let i = 0; i < 2; i++) {
      const cap = randInt(80, 300);
      const occ = Math.round(cap * rand(0.66, 1.02));
      hostels.push({
        id: `${d.id}-H${i + 1}`,
        name: `${pick(['Govt.', 'Ashram', 'EMRS', 'Aided'])} Tribal Hostel ${d.name} ${i % 2 === 0 ? '(Boys)' : '(Girls)'}`,
        district: d.name, type: i % 2 === 0 ? 'Boys' : 'Girls',
        capacity: cap, occupancy: Math.min(cap, occ),
        utilization: round((occ / cap) * 100, 1),
        attendance: round(rand(72, 95), 1),
        mealCompliance: round(rand(78, 99), 1),
        infraScore: round(rand(48, 92), 1),
        grievances: randInt(0, 24),
      });
    }
  });

  const dropoutPrediction = ds.map((d) => ({
    district: d.name, predictedDropouts: randInt(120, 2400), confidence: round(rand(72, 94), 1), risk: d.dropoutRisk,
  })).sort((a, b) => b.predictedDropouts - a.predictedDropouts).slice(0, 10);

  return { meta: DATA.meta, kpis, scholarshipStatus, districtStudents, genderContinuation, hostels, dropoutPrediction };
}

// ---------------------------------------------------------------------------
// 5. NUTRITION & HEALTH
// ---------------------------------------------------------------------------
export function buildHealth(query = {}) {
  const ds = filterDistricts(query);

  const kpis = [
    { key: 'maternal', label: 'Maternal Health Risk', value: round(rand(14, 32), 1), format: 'percent', tone: 'danger', trend: -1.4 },
    { key: 'malnutrition', label: 'Child Malnutrition Risk (SAM+MAM)', value: round(rand(16, 38), 1), format: 'percent', tone: 'danger', trend: -2.2 },
    { key: 'anemia', label: 'Anemia Risk (Women & Children)', value: round(rand(28, 52), 1), format: 'percent', tone: 'warning', trend: -1.0 },
    { key: 'phc', label: 'PHC Access Gap', value: round(rand(18, 44), 1), format: 'percent', tone: 'warning', trend: -0.6 },
    { key: 'immunization', label: 'Immunization Coverage', value: round(sum(ds, (d) => d.immunizationCoverage) / ds.length, 1), format: 'percent', trend: +1.8 },
    { key: 'highrisk', label: 'High-Risk Villages', value: DATA.villages.filter((v) => v.nutritionRisk > 35 && ds.some((d) => d.id === v.districtId)).length, format: 'number', tone: 'danger' },
    { key: 'visits', label: 'Health Worker Visit Compliance', value: round(rand(68, 91), 1), format: 'percent', trend: +2.4 },
    { key: 'hvi', label: 'District Health Vulnerability Index', value: round(rand(42, 68), 1), format: 'index', tone: 'warning' },
  ];

  const malnutritionByDistrict = ds.map((d) => ({
    district: d.name, sam: randInt(40, 620), mam: randInt(180, 1800),
    anemia: round(rand(26, 54), 1), immunization: d.immunizationCoverage,
    vulnerabilityIndex: round(rand(40, 72), 1),
  })).sort((a, b) => b.vulnerabilityIndex - a.vulnerabilityIndex);

  const seasonalDisease = MONTHS.map((m, i) => ({
    month: m,
    malaria: round(rand(20, 120) + (i > 3 && i < 8 ? 60 : 0), 0),
    gastro: round(rand(15, 90) + (i > 8 ? 40 : 0), 0),
    respiratory: round(rand(25, 100) + (i < 3 ? 50 : 0), 0),
    sickleCell: round(rand(10, 45), 0),
  }));

  const highRiskVillages = [...DATA.villages]
    .filter((v) => ds.some((d) => d.id === v.districtId))
    .sort((a, b) => b.nutritionRisk - a.nutritionRisk)
    .slice(0, 14)
    .map((v) => ({
      id: v.id, village: v.name, block: v.blockName, district: v.districtName,
      lat: v.lat, lng: v.lng, nutritionRisk: v.nutritionRisk, healthGap: v.healthAccessGap,
      phcDistanceKm: v.phcDistanceKm, band: v.riskBand,
      intervention: v.nutritionRisk > 40 ? 'Amrut Aahar + VCDC' : 'ICDS monitoring',
    }));

  const interventionMap = DATA.villages
    .filter((v) => ds.some((d) => d.id === v.districtId))
    .map((v) => ({ id: v.id, name: v.name, lat: v.lat, lng: v.lng, score: v.nutritionRisk, band: v.riskBand, district: v.districtName }));

  const healthWorkerTracking = ds.map((d) => ({
    district: d.name,
    asha: randInt(120, 1400), anm: randInt(40, 480),
    visitsPlanned: randInt(2000, 12000),
    visitsDone: 0, compliance: 0,
  }));
  healthWorkerTracking.forEach((h) => {
    h.visitsDone = Math.round(h.visitsPlanned * rand(0.66, 0.95));
    h.compliance = round((h.visitsDone / h.visitsPlanned) * 100, 1);
  });

  return { meta: DATA.meta, kpis, malnutritionByDistrict, seasonalDisease, highRiskVillages, interventionMap, healthWorkerTracking };
}

// ---------------------------------------------------------------------------
// 6. MIGRATION & LIVELIHOOD
// ---------------------------------------------------------------------------
export function buildMigration(query = {}) {
  const ds = filterDistricts(query);

  const kpis = [
    { key: 'households', label: 'Households Tracked (Migration)', value: randInt(180000, 420000), format: 'number' },
    { key: 'migrating', label: 'Seasonal Out-Migration', value: round(rand(11, 34), 1), format: 'percent', tone: 'warning', trend: +2.1 },
    { key: 'mgnrega', label: 'MGNREGA Utilization', value: round(rand(54, 86), 1), format: 'percent', trend: +3.4 },
    { key: 'shg', label: 'SHG Participation', value: round(rand(38, 72), 1), format: 'percent', trend: +4.0 },
    { key: 'vandhan', label: 'Van Dhan / MFP Coverage', value: round(rand(28, 58), 1), format: 'percent', trend: +2.7 },
    { key: 'skill', label: 'Skill Training Coverage', value: round(rand(22, 49), 1), format: 'percent', trend: +1.9 },
    { key: 'stress', label: 'Avg Livelihood Stress Score', value: round(rand(46, 71), 1), format: 'index', tone: 'danger' },
    { key: 'income', label: 'Income Vulnerability Clusters', value: sum(ds, (d) => d.migrationClusters), format: 'number', tone: 'warning' },
  ];

  const migrationHeatmap = DATA.villages
    .filter((v) => ds.some((d) => d.id === v.districtId))
    .map((v) => ({ id: v.id, name: v.name, lat: v.lat, lng: v.lng, score: v.migrationRisk, band: v.riskBand, district: v.districtName }));

  const sourceVillages = [...DATA.villages]
    .filter((v) => ds.some((d) => d.id === v.districtId))
    .sort((a, b) => b.migrationRisk - a.migrationRisk)
    .slice(0, 12)
    .map((v) => ({
      village: v.name, block: v.blockName, district: v.districtName,
      migrationRisk: v.migrationRisk, households: v.households,
      migratingHouseholds: Math.round(v.households * v.migrationRisk / 100),
      tribalGroup: v.tribalGroup,
      destination: pick(['Gujarat (Sugarcane)', 'Nashik (Grape farms)', 'Pune (Construction)', 'Surat (Textile)', 'Mumbai (Construction)', 'Vidarbha (Cotton)']),
    }));

  const corridors = [
    { from: 'Nandurbar', to: 'Gujarat — Sugarcane Belt', volume: randInt(8000, 42000), distanceKm: 180, stress: round(rand(58, 80), 1) },
    { from: 'Palghar', to: 'Nashik — Grape/Onion Farms', volume: randInt(6000, 30000), distanceKm: 120, stress: round(rand(52, 74), 1) },
    { from: 'Gadchiroli', to: 'Telangana — Cotton/Chilli', volume: randInt(4000, 22000), distanceKm: 210, stress: round(rand(60, 82), 1) },
    { from: 'Amravati (Melghat)', to: 'Madhya Pradesh — Soybean', volume: randInt(3000, 18000), distanceKm: 150, stress: round(rand(55, 78), 1) },
    { from: 'Thane', to: 'Mumbai — Construction', volume: randInt(5000, 26000), distanceKm: 70, stress: round(rand(48, 70), 1) },
    { from: 'Dhule', to: 'Surat — Textile/Diamond', volume: randInt(4000, 20000), distanceKm: 160, stress: round(rand(54, 76), 1) },
  ];

  const livelihoodTable = ds.map((d) => ({
    district: d.name, division: d.division,
    mgnregaDays: randInt(38, 92),
    shgGroups: randInt(400, 5200),
    vandhanKendras: randInt(2, 38),
    avgIncomeMonthly: randInt(4200, 11800),
    stressScore: round(rand(44, 74), 1),
    migrationRisk: d.migrationRisk,
  })).sort((a, b) => b.stressScore - a.stressScore);

  const livelihoodTrend = MONTHS.map((m, i) => ({
    month: m,
    mgnregaDemand: round(rand(40, 90) + (i > 8 || i < 2 ? 25 : 0), 0),
    migration: round(rand(10, 40) + (i > 9 || i < 3 ? 20 : 0), 0),
    mfpCollection: round(rand(20, 70), 0),
  }));

  return { meta: DATA.meta, kpis, migrationHeatmap, sourceVillages, corridors, livelihoodTable, livelihoodTrend };
}

// ---------------------------------------------------------------------------
// 7. LAND & FOREST RIGHTS (FRA)
// ---------------------------------------------------------------------------
export function buildFra(query = {}) {
  const ds = filterDistricts(query);
  const received = sum(ds, (d) => d.fraBacklog) + randInt(40000, 120000);
  const approved = Math.round(received * rand(0.52, 0.7));
  const pending = sum(ds, (d) => d.fraBacklog);
  const rejected = received - approved - pending;

  const kpis = [
    { key: 'received', label: 'FRA Claims Received', value: received, format: 'number' },
    { key: 'approved', label: 'Claims Approved (Titles)', value: approved, format: 'number', trend: +4.6 },
    { key: 'pending', label: 'Claims Pending', value: pending, format: 'number', tone: 'warning', trend: -5.2 },
    { key: 'rejected', label: 'Claims Rejected', value: Math.max(0, rejected), format: 'number', tone: 'danger', trend: -1.0 },
    { key: 'delay', label: 'Avg Approval Delay', value: randInt(64, 210), format: 'days', tone: 'warning', trend: -3.1 },
    { key: 'cfr', label: 'Community Forest Rights (CFR)', value: randInt(1800, 7200), format: 'number', trend: +2.8 },
    { key: 'ifr', label: 'Individual Forest Rights (IFR)', value: approved - randInt(1000, 4000), format: 'number', trend: +3.5 },
    { key: 'disputes', label: 'Dispute-Risk Alerts', value: randInt(120, 880), format: 'number', tone: 'danger' },
  ];

  const claimStatus = [
    { status: 'Approved', value: approved },
    { status: 'Pending', value: pending },
    { status: 'Rejected', value: Math.max(0, rejected) },
  ];

  const districtPerformance = ds.map((d) => {
    const rec = d.fraBacklog + randInt(2000, 14000);
    const app = Math.round(rec * rand(0.5, 0.74));
    return {
      id: d.id, district: d.name, division: d.division,
      received: rec, approved: app, pending: d.fraBacklog, rejected: Math.max(0, rec - app - d.fraBacklog),
      approvalRate: round((app / rec) * 100, 1),
      avgDelayDays: randInt(58, 200), disputes: randInt(8, 120),
    };
  }).sort((a, b) => a.approvalRate - b.approvalRate);

  const geoClaims = DATA.villages
    .filter((v) => ds.some((d) => d.id === v.districtId) && v.fraBacklog >= 0)
    .map((v) => ({
      id: v.id, name: v.name, lat: v.lat, lng: v.lng, district: v.districtName,
      backlog: v.fraBacklog, band: v.fraBacklog > 120 ? 'Critical' : v.fraBacklog > 60 ? 'High' : v.fraBacklog > 20 ? 'Moderate' : 'Stable',
      status: pick(['Verification', 'SDLC Review', 'DLC Pending', 'Title Granted']),
    }));

  const villageBacklog = [...DATA.villages]
    .filter((v) => ds.some((d) => d.id === v.districtId))
    .sort((a, b) => b.fraBacklog - a.fraBacklog)
    .slice(0, 12)
    .map((v) => ({ village: v.name, block: v.blockName, district: v.districtName, backlog: v.fraBacklog, tribalGroup: v.tribalGroup }));

  const progressTrend = MONTHS.map((m, i) => ({
    month: m,
    received: round(rand(800, 2200), 0),
    approved: round(rand(500, 1600) + i * 30, 0),
    pending: round(rand(2000, 5000) - i * 80, 0),
  }));

  return { meta: DATA.meta, kpis, claimStatus, districtPerformance, geoClaims, villageBacklog, progressTrend };
}

// ---------------------------------------------------------------------------
// 8. GRIEVANCE & CITIZEN TRUST
// ---------------------------------------------------------------------------
export function buildGrievances(query = {}) {
  const ds = filterDistricts(query);
  const open = sum(ds, (d) => d.grievancesOpen);

  const categories = [
    { category: 'Tribal Welfare / Scheme', count: randInt(3200, 9800) },
    { category: 'Scholarship', count: randInt(2800, 8400) },
    { category: 'DBT / Payment', count: randInt(2400, 7600) },
    { category: 'Hostel / Ashram Shala', count: randInt(1400, 5200) },
    { category: 'Land / FRA', count: randInt(1800, 6200) },
    { category: 'Health / Nutrition', count: randInt(900, 3800) },
    { category: 'Employment / MGNREGA', count: randInt(700, 3200) },
  ].sort((a, b) => b.count - a.count);
  const totalG = sum(categories, (c) => c.count);

  const kpis = [
    { key: 'total', label: 'Total Grievances', value: totalG, format: 'number', trend: -2.4 },
    { key: 'welfare', label: 'Welfare/Scheme Grievances', value: categories.find((c) => c.category.includes('Welfare')).count, format: 'number' },
    { key: 'scholarship', label: 'Scholarship Grievances', value: categories.find((c) => c.category === 'Scholarship').count, format: 'number', tone: 'warning' },
    { key: 'dbt', label: 'DBT / Payment Grievances', value: categories.find((c) => c.category.includes('DBT')).count, format: 'number', tone: 'warning' },
    { key: 'hostel', label: 'Hostel Grievances', value: categories.find((c) => c.category.includes('Hostel')).count, format: 'number' },
    { key: 'land', label: 'Land / FRA Grievances', value: categories.find((c) => c.category.includes('Land')).count, format: 'number', tone: 'warning' },
    { key: 'resolution', label: 'Avg Resolution Time', value: round(rand(8, 19), 1), format: 'days', tone: 'warning', trend: -1.6 },
    { key: 'escalated', label: 'Escalated Cases', value: open, format: 'number', tone: 'danger', trend: -3.0 },
  ];

  const sentiment = [
    { label: 'Positive', value: round(rand(28, 42), 1), tone: 'good' },
    { label: 'Neutral', value: round(rand(30, 44), 1), tone: 'neutral' },
    { label: 'Negative', value: round(rand(20, 36), 1), tone: 'bad' },
  ];

  const districtHeat = ds.map((d) => ({
    id: d.id, name: d.name, lat: d.lat, lng: d.lng, division: d.division,
    grievances: d.grievancesOpen + randInt(200, 2000),
    resolutionDays: round(rand(7, 21), 1),
    escalated: d.grievancesOpen,
    satisfaction: round(rand(54, 86), 1),
    score: round(rand(30, 85), 1), band: d.riskBand,
  })).sort((a, b) => b.grievances - a.grievances);

  const resolutionTrend = MONTHS.map((m, i) => ({
    month: m, received: randInt(2200, 5200), resolved: randInt(1800, 5000),
    avgDays: round(rand(8, 18) - i * 0.2, 1),
  }));

  const recurring = [
    { complaint: 'Scholarship amount not credited', count: randInt(1800, 4800), trend: 'up' },
    { complaint: 'MahaDBT login / Aadhaar OTP failure', count: randInt(1400, 3900), trend: 'down' },
    { complaint: 'Hostel mess quality / facilities', count: randInt(900, 2800), trend: 'up' },
    { complaint: 'FRA claim status not updated', count: randInt(1100, 3200), trend: 'flat' },
    { complaint: 'Ration / Amrut Aahar not received', count: randInt(700, 2400), trend: 'down' },
    { complaint: 'Delay in caste validity certificate', count: randInt(800, 2600), trend: 'up' },
  ].sort((a, b) => b.count - a.count);

  return { meta: DATA.meta, kpis, categories: categories.map((c) => ({ ...c, share: round((c.count / totalG) * 100, 1) })), sentiment, districtHeat, resolutionTrend, recurring };
}

// ---------------------------------------------------------------------------
// 9. RESPONSIBLE AI & COMPLIANCE
// ---------------------------------------------------------------------------
export function buildCompliance() {
  const kpis = [
    { key: 'hitl', label: 'Human-in-the-Loop Review Rate', value: 100, format: 'percent', tone: 'good', sub: 'All AI outputs reviewed' },
    { key: 'confidence', label: 'Avg Model Confidence', value: round(rand(82, 93), 1), format: 'percent', trend: +1.1 },
    { key: 'bias', label: 'Bias Monitoring Score', value: round(rand(86, 96), 1), format: 'index', tone: 'good' },
    { key: 'dpdp', label: 'DPDP Compliance', value: round(rand(88, 98), 1), format: 'percent', tone: 'good' },
    { key: 'cyber', label: 'Cybersecurity Health Score', value: round(rand(78, 94), 1), format: 'index', trend: +2.2 },
    { key: 'audit', label: 'AI Recommendation Audit Logs', value: randInt(120000, 280000), format: 'number' },
    { key: 'minimization', label: 'Data Minimization Adherence', value: round(rand(90, 99), 1), format: 'percent', tone: 'good' },
    { key: 'incidents', label: 'Open Security Incidents', value: randInt(0, 4), format: 'number', tone: 'warning' },
  ];

  const dpdpChecklist = [
    { item: 'Consent capture & purpose limitation', status: 'Compliant' },
    { item: 'Data minimization (only welfare-relevant fields)', status: 'Compliant' },
    { item: 'Aadhaar data masked / tokenized', status: 'Compliant' },
    { item: 'Data Protection Officer designated', status: 'Compliant' },
    { item: 'Grievance redressal for data principals', status: 'Compliant' },
    { item: 'Retention & deletion policy enforced', status: 'In Review' },
    { item: 'Cross-border transfer restriction', status: 'Compliant' },
    { item: 'Breach notification workflow (CERT-In)', status: 'Compliant' },
  ];

  const rbac = [
    { role: 'CM Office', access: 'State read-only, all modules', users: 12, scope: 'State' },
    { role: 'Chief Secretary', access: 'Full read, brief approval', users: 6, scope: 'State' },
    { role: 'Principal Secretary (Tribal)', access: 'Full read-write (policy)', users: 9, scope: 'State' },
    { role: 'District Collector', access: 'District read-write', users: 12, scope: 'District' },
    { role: 'Project Officer (ITDP)', access: 'Block/village ops', users: 29, scope: 'Block' },
    { role: 'MahaIT Admin', access: 'System config, no PII export', users: 7, scope: 'Platform' },
    { role: 'Auditor', access: 'Read-only audit logs', users: 4, scope: 'Audit' },
  ];

  const auditLogs = Array.from({ length: 12 }).map((_, i) => ({
    id: `AUD-${90000 + i}`,
    timestamp: new Date(Date.now() - i * randInt(1, 8) * 3600 * 1000).toISOString(),
    actor: pick(['District Collector', 'PO ITDP Nandurbar', 'Dy. Director Tribal', 'MahaIT Admin', 'Auditor']),
    action: pick(['Reviewed AI risk recommendation', 'Overrode model flag (human decision)', 'Approved intervention list', 'Exported anonymized report', 'Acknowledged DBT alert']),
    module: pick(['Welfare', 'Education', 'Health', 'FRA', 'Migration', 'Grievances']),
    decision: pick(['Accepted', 'Overridden', 'Escalated', 'Deferred']),
    confidence: round(rand(70, 96), 1),
  }));

  const biasMonitoring = [
    { dimension: 'Gender parity (M/F)', score: round(rand(88, 97), 1) },
    { dimension: 'PVTG vs non-PVTG', score: round(rand(84, 95), 1) },
    { dimension: 'Remote vs accessible villages', score: round(rand(80, 93), 1) },
    { dimension: 'Tribal group representation', score: round(rand(85, 96), 1) },
  ];

  const explainability = {
    sampleRecommendation: 'Prioritize 6 villages in Dhadgaon block (Nandurbar) for Amrut Aahar escalation',
    confidence: round(rand(84, 94), 1),
    drivers: [
      { factor: 'SAM child cluster density', weight: 0.34 },
      { factor: 'PHC distance > 15 km', weight: 0.27 },
      { factor: 'Seasonal migration outflow', weight: 0.21 },
      { factor: 'Immunization coverage dip', weight: 0.18 },
    ],
  };

  const incidents = [
    { id: 'INC-2041', severity: 'Low', type: 'Phishing attempt (blocked)', status: 'Closed', certIn: 'Reported', date: '2026-05-22' },
    { id: 'INC-2042', severity: 'Medium', type: 'Anomalous API access pattern', status: 'Mitigated', certIn: 'Reported', date: '2026-05-28' },
    { id: 'INC-2043', severity: 'Low', type: 'Expired TLS certificate (renewed)', status: 'Closed', certIn: 'N/A', date: '2026-05-30' },
  ];

  return { meta: DATA.meta, kpis, dpdpChecklist, rbac, auditLogs, biasMonitoring, explainability, incidents };
}

// ---------------------------------------------------------------------------
// 10. REPORTS & DECISION BRIEFS
// ---------------------------------------------------------------------------
export function buildReports(query = {}) {
  const ds = filterDistricts(query);
  const worst = [...ds].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);
  const best = [...ds].sort((a, b) => a.rank - b.rank).slice(0, 3);

  const cmBrief = {
    title: 'CM Office — State Tribal Welfare Brief',
    period: 'June 2026',
    summary: `Across ${ds.length} priority tribal districts, welfare expenditure monitored stands at ₹${round(sum(ds, (d) => d.expenditureCr), 0)} Cr with average Tribal Development Index of ${round(sum(ds, (d) => d.tdi) / ds.length, 1)}. ${worst.length} districts (${worst.map((d) => d.name).join(', ')}) remain on critical watch driven by DBT failures, nutrition clusters and FRA backlog.`,
    highlights: [
      `${sum(ds, (d) => d.dbtFailures).toLocaleString('en-IN')} DBT failure alerts open — Aadhaar/bank seeding drive recommended.`,
      `FRA backlog of ${sum(ds, (d) => d.fraBacklog).toLocaleString('en-IN')} claims; ${worst[0]?.name} contributes the largest share.`,
      `Scholarship pendency of ${sum(ds, (d) => d.scholarshipPending).toLocaleString('en-IN')} cases trending down 4.7% this cycle.`,
      `Top performer: ${best[0]?.name} (TDI ${best[0]?.tdi}); requires replication of saturation model.`,
    ],
  };

  const collectorBrief = {
    title: 'District Collector — Action Brief',
    district: worst[0]?.name || ds[0]?.name,
    actions: [
      'Convene DLC for FRA claims pending beyond SLA within 7 days.',
      'Launch Aadhaar-bank seeding camp in top 5 high-failure blocks.',
      'Activate Amrut Aahar escalation in critical nutrition villages.',
      'Review hostel mess compliance flagged in grievance dashboard.',
    ],
  };

  const psNote = {
    title: 'Principal Secretary (Tribal Dev.) — Review Note',
    points: [
      `Budget utilization at ${round(sum(ds, (d) => d.expenditureCr) / sum(ds, (d) => d.allocationCr) * 100, 1)}% — accelerate Q1 release for lagging districts.`,
      'Convergence with W&CD and Public Health required for nutrition clusters.',
      'PVTG (Katkari, Kolam, Madia Gond) special package coverage to be audited.',
      'Migration corridor MoU with Gujarat/Telangana for inter-state worker tracking.',
    ],
  };

  const top10 = [...DATA.villages]
    .filter((v) => ds.some((d) => d.id === v.districtId))
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
    .slice(0, 10)
    .map((v, i) => ({
      rank: i + 1, village: v.name, block: v.blockName, district: v.districtName,
      score: v.vulnerabilityScore, band: v.riskBand, priority: v.interventionPriority,
      recommendedAction: pick(['Nutrition + Health camp', 'DBT seeding drive', 'FRA fast-track', 'Hostel + scholarship review', 'Livelihood/MGNREGA push']),
    }));

  const escalationMatrix = ds.map((d) => ({
    district: d.name,
    likelihood: d.riskScore > 70 ? 'High' : d.riskScore > 50 ? 'Medium' : 'Low',
    impact: d.tribalPopulation > 700000 ? 'High' : d.tribalPopulation > 350000 ? 'Medium' : 'Low',
    riskScore: d.riskScore, band: d.riskBand,
    owner: 'District Collector',
  })).sort((a, b) => b.riskScore - a.riskScore);

  const monthlySummary = MONTHS.map((m) => ({
    month: m,
    expenditureCr: round(rand(40, 110), 1),
    beneficiariesReached: randInt(40000, 160000),
    grievancesResolved: randInt(2000, 5200),
    riskIndex: round(rand(46, 58), 1),
  }));

  const reportList = [
    { id: 'R001', name: 'State Tribal Welfare Brief — June 2026', type: 'CM Brief', generated: '2026-06-01', format: 'PDF', pages: 14 },
    { id: 'R002', name: 'District Collector Action Pack (12 districts)', type: 'Collector Brief', generated: '2026-06-01', format: 'PDF', pages: 48 },
    { id: 'R003', name: 'Principal Secretary Review Note', type: 'PS Note', generated: '2026-05-31', format: 'PDF', pages: 9 },
    { id: 'R004', name: 'Monthly Performance Summary (CSV)', type: 'Data Export', generated: '2026-06-01', format: 'CSV', pages: 1 },
    { id: 'R005', name: 'Top 10 Intervention Priorities', type: 'Decision Brief', generated: '2026-06-01', format: 'PDF', pages: 6 },
    { id: 'R006', name: 'Risk Escalation Matrix', type: 'Risk Register', generated: '2026-05-30', format: 'CSV', pages: 1 },
  ];

  return { meta: DATA.meta, cmBrief, collectorBrief, psNote, top10, escalationMatrix, monthlySummary, reportList };
}
