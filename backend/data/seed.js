// ---------------------------------------------------------------------------
// Maha Tribal Intelligence Grid — Deterministic mock data generator
// All numbers are "Simulated for PoC". Built around real Maharashtra tribal
// districts, divisions, schemes, PVTGs and tribal groups.
// A seeded PRNG keeps values stable across server restarts.
// ---------------------------------------------------------------------------

// --- Seeded pseudo random number generator (mulberry32) --------------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20240607);
const rand = (min, max) => min + (max - min) * rng();
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const round = (n, d = 0) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

// --- Reference master data --------------------------------------------------
export const DIVISIONS = ['Nashik', 'Nagpur', 'Konkan', 'Amravati', 'Pune'];

export const TRIBAL_GROUPS = [
  'Bhil', 'Gond', 'Warli', 'Kokna', 'Mahadev Koli', 'Pawra',
  'Thakar', 'Katkari (PVTG)', 'Kolam (PVTG)', 'Madia Gond (PVTG)', 'Korku', 'Pardhan',
];

export const PVTG_GROUPS = ['Katkari', 'Kolam', 'Madia Gond'];

export const VULNERABILITY_CATEGORIES = [
  'Critical', 'High', 'Moderate', 'Watch', 'Stable',
];

export const DEPARTMENTS = [
  'Tribal Development', 'School Education', 'Public Health', 'Women & Child Development',
  'Rural Development', 'Skill Development', 'Forest', 'Social Justice',
];

// 25 realistic schemes
export const SCHEMES = [
  { id: 'SCH01', name: 'Post-Matric Scholarship (Tribal)', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH02', name: 'Pre-Matric Scholarship (Tribal)', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH03', name: 'Govt. Tribal Ashram Shala', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH04', name: 'Eklavya Model Residential School', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH05', name: 'Govt. Tribal Hostel (Boys)', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH06', name: 'Govt. Tribal Hostel (Girls)', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH07', name: 'Swayam Yojana (Outstation Allowance)', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH08', name: 'Foreign Scholarship for ST Students', dept: 'Tribal Development', category: 'Education' },
  { id: 'SCH09', name: 'MahaDBT Welfare Transfer', dept: 'Tribal Development', category: 'DBT' },
  { id: 'SCH10', name: 'Khavti Loan / Subsistence Allowance', dept: 'Tribal Development', category: 'Livelihood' },
  { id: 'SCH11', name: 'Birsa Munda Krishi Kranti Yojana', dept: 'Tribal Development', category: 'Livelihood' },
  { id: 'SCH12', name: 'Thakkar Bappa Adivasi Vasti Yojana', dept: 'Tribal Development', category: 'Infrastructure' },
  { id: 'SCH13', name: 'Shabari Adivasi Gharkul Yojana', dept: 'Tribal Development', category: 'Housing' },
  { id: 'SCH14', name: 'PVTG Special Development Package', dept: 'Tribal Development', category: 'PVTG' },
  { id: 'SCH15', name: 'Bharat Ratna APJ Skill Dev. (Tribal)', dept: 'Skill Development', category: 'Skill' },
  { id: 'SCH16', name: 'MGNREGA (Tribal Belt)', dept: 'Rural Development', category: 'Livelihood' },
  { id: 'SCH17', name: 'Integrated Child Development (ICDS)', dept: 'Women & Child Development', category: 'Nutrition' },
  { id: 'SCH18', name: 'Bharari Pathak (Mobile Health)', dept: 'Public Health', category: 'Health' },
  { id: 'SCH19', name: 'Navsanjeevani Yojana (Tribal Health)', dept: 'Public Health', category: 'Health' },
  { id: 'SCH20', name: 'Amrut Aahar Yojana (Nutrition)', dept: 'Women & Child Development', category: 'Nutrition' },
  { id: 'SCH21', name: 'Forest Rights Act (FRA) Title', dept: 'Forest', category: 'Land Rights' },
  { id: 'SCH22', name: 'Van Dhan Vikas Kendra (MFP)', dept: 'Tribal Development', category: 'Livelihood' },
  { id: 'SCH23', name: 'Adim Jamati Vikas (PVTG Income)', dept: 'Tribal Development', category: 'PVTG' },
  { id: 'SCH24', name: 'Manav Vikas Mission', dept: 'Social Justice', category: 'Human Development' },
  { id: 'SCH25', name: 'Tribal Sub-Plan Convergence Grant', dept: 'Tribal Development', category: 'Convergence' },
];

// 12 districts with division, approx geo-centroid, tribal population
const DISTRICT_DEFS = [
  { id: 'D01', name: 'Nandurbar', division: 'Nashik', lat: 21.367, lng: 74.240, tribalShare: 0.69 },
  { id: 'D02', name: 'Gadchiroli', division: 'Nagpur', lat: 19.730, lng: 80.000, tribalShare: 0.39 },
  { id: 'D03', name: 'Palghar', division: 'Konkan', lat: 19.696, lng: 72.765, tribalShare: 0.38 },
  { id: 'D04', name: 'Nashik', division: 'Nashik', lat: 19.997, lng: 73.790, tribalShare: 0.27 },
  { id: 'D05', name: 'Dhule', division: 'Nashik', lat: 20.902, lng: 74.778, tribalShare: 0.26 },
  { id: 'D06', name: 'Chandrapur', division: 'Nagpur', lat: 19.950, lng: 79.297, tribalShare: 0.18 },
  { id: 'D07', name: 'Yavatmal', division: 'Amravati', lat: 20.388, lng: 78.121, tribalShare: 0.19 },
  { id: 'D08', name: 'Amravati', division: 'Amravati', lat: 21.000, lng: 77.750, tribalShare: 0.14 },
  { id: 'D09', name: 'Thane', division: 'Konkan', lat: 19.450, lng: 73.250, tribalShare: 0.15 },
  { id: 'D10', name: 'Raigad', division: 'Konkan', lat: 18.520, lng: 73.180, tribalShare: 0.12 },
  { id: 'D11', name: 'Ahmednagar', division: 'Nashik', lat: 19.500, lng: 74.500, tribalShare: 0.09 },
  { id: 'D12', name: 'Pune (Tribal Belt)', division: 'Pune', lat: 19.100, lng: 73.560, tribalShare: 0.07 },
];

// Block names per district (~3-4 each → 40 blocks)
const BLOCK_NAMES = {
  Nandurbar: ['Dhadgaon', 'Akkalkuwa', 'Taloda', 'Navapur'],
  Gadchiroli: ['Bhamragad', 'Etapalli', 'Aheri', 'Sironcha'],
  Palghar: ['Mokhada', 'Jawhar', 'Vikramgad', 'Dahanu'],
  Nashik: ['Peth', 'Surgana', 'Trimbakeshwar', 'Kalwan'],
  Dhule: ['Sakri', 'Shirpur', 'Sindkheda'],
  Chandrapur: ['Jiwati', 'Korpana', 'Gondpipri'],
  Yavatmal: ['Maregaon', 'Kelapur', 'Ghatanji'],
  Amravati: ['Dharni', 'Chikhaldara', 'Achalpur'],
  Thane: ['Shahapur', 'Murbad', 'Bhiwandi'],
  Raigad: ['Karjat', 'Khalapur', 'Sudhagad'],
  Ahmednagar: ['Akole', 'Sangamner'],
  'Pune (Tribal Belt)': ['Ambegaon', 'Junnar', 'Velhe'],
};

const VILLAGE_PREFIX = [
  'Pada', 'Wadi', 'Tola', 'Bori', 'Amba', 'Sawar', 'Dongar', 'Pimpal',
  'Khadak', 'Nimbhora', 'Garda', 'Kosbad', 'Chinchpada', 'Vangaon',
  'Zari', 'Bhamragad', 'Kothara', 'Sakhar', 'Mendha', 'Lekha',
];

// --- Build districts --------------------------------------------------------
function riskBand(score) {
  if (score >= 75) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 45) return 'Moderate';
  if (score >= 30) return 'Watch';
  return 'Stable';
}

const districts = DISTRICT_DEFS.map((d, i) => {
  const tribalPopulation = randInt(180000, 1450000);
  const beneficiaries = Math.round(tribalPopulation * rand(0.32, 0.58));
  const riskScore = round(rand(28, 86), 1);
  const tdi = round(100 - riskScore * rand(0.55, 0.75) + rand(-5, 8), 1); // Tribal Dev Index
  const expenditure = round(rand(120, 980), 1); // ₹ crore
  const allocation = round(expenditure / rand(0.62, 0.94), 1);
  return {
    id: d.id,
    name: d.name,
    division: d.division,
    lat: d.lat,
    lng: d.lng,
    tribalPopulation,
    tribalShare: d.tribalShare,
    beneficiaries,
    riskScore,
    riskBand: riskBand(riskScore),
    tdi: Math.max(18, Math.min(82, tdi)),
    rank: 0, // filled later
    allocationCr: allocation,
    expenditureCr: expenditure,
    utilizationPct: round((expenditure / allocation) * 100, 1),
    dbtFailures: randInt(120, 4200),
    scholarshipPending: randInt(300, 9800),
    nutritionClusters: randInt(2, 28),
    migrationClusters: randInt(1, 22),
    fraBacklog: randInt(180, 5200),
    grievancesOpen: randInt(60, 1900),
    welfareCoverage: round(rand(48, 92), 1),
    dropoutRisk: round(rand(6, 31), 1),
    nutritionRisk: round(rand(11, 44), 1),
    migrationRisk: round(rand(8, 47), 1),
    immunizationCoverage: round(rand(61, 97), 1),
    primaryTribes: [TRIBAL_GROUPS[i % TRIBAL_GROUPS.length], TRIBAL_GROUPS[(i + 4) % TRIBAL_GROUPS.length]],
  };
});

// rank by TDI (higher TDI = better rank #1)
[...districts]
  .sort((a, b) => b.tdi - a.tdi)
  .forEach((d, idx) => {
    districts.find((x) => x.id === d.id).rank = idx + 1;
  });

// --- Build blocks -----------------------------------------------------------
const blocks = [];
districts.forEach((d) => {
  (BLOCK_NAMES[d.name] || ['Block-1', 'Block-2', 'Block-3']).forEach((bn, bi) => {
    const risk = round(rand(25, 88), 1);
    blocks.push({
      id: `${d.id}-B${bi + 1}`,
      name: bn,
      districtId: d.id,
      districtName: d.name,
      riskScore: risk,
      riskBand: riskBand(risk),
      villages: randInt(8, 22),
      households: randInt(2200, 14500),
      welfareCoverage: round(rand(45, 93), 1),
      dropoutRisk: round(rand(5, 33), 1),
      nutritionRisk: round(rand(9, 46), 1),
      migrationRisk: round(rand(7, 49), 1),
      schemeSaturation: round(rand(38, 95), 1),
      pendingGrievances: randInt(10, 420),
      healthAccessGap: round(rand(8, 52), 1),
    });
  });
});

// --- Build villages (150) ---------------------------------------------------
const villages = [];
let vCount = 0;
const targetVillages = 150;
while (vCount < targetVillages) {
  for (const b of blocks) {
    if (vCount >= targetVillages) break;
    const d = districts.find((x) => x.id === b.districtId);
    const vScore = round(rand(20, 95), 1);
    villages.push({
      id: `V${String(vCount + 1).padStart(3, '0')}`,
      name: `${pick(VILLAGE_PREFIX)}${pick(['pada', 'wadi', 'tola', 'gaon', 'khurd'])}`,
      blockId: b.id,
      blockName: b.name,
      districtId: d.id,
      districtName: d.name,
      lat: round(d.lat + rand(-0.45, 0.45), 4),
      lng: round(d.lng + rand(-0.45, 0.45), 4),
      households: randInt(80, 940),
      population: randInt(380, 4200),
      vulnerabilityScore: vScore,
      riskBand: riskBand(vScore),
      welfareCoverage: round(rand(40, 96), 1),
      dropoutRisk: round(rand(4, 38), 1),
      nutritionRisk: round(rand(8, 51), 1),
      migrationRisk: round(rand(6, 55), 1),
      healthAccessGap: round(rand(5, 58), 1),
      phcDistanceKm: round(rand(2, 34), 1),
      fraBacklog: randInt(0, 180),
      tribalGroup: pick(TRIBAL_GROUPS),
      interventionPriority: vScore >= 70 ? 'Immediate' : vScore >= 50 ? 'High' : vScore >= 35 ? 'Medium' : 'Routine',
    });
    vCount += 1;
  }
}

// --- Aggregate helpers ------------------------------------------------------
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
const totalPopulation = sum(districts, (d) => d.tribalPopulation);
const totalBeneficiaries = sum(districts, (d) => d.beneficiaries);
const totalExpenditure = round(sum(districts, (d) => d.expenditureCr), 1);
const totalAllocation = round(sum(districts, (d) => d.allocationCr), 1);

// --- Time series (12 months) ------------------------------------------------
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
function series(base, vol, drift = 0) {
  let v = base;
  return MONTHS.map((m, i) => {
    v = Math.max(0, v + rand(-vol, vol) + drift);
    return { month: m, value: round(v, 1) };
  });
}

export const DATA = {
  meta: {
    platform: 'Maha Tribal Intelligence Grid',
    tagline: 'AI-enabled Tribal Welfare Assurance, Vulnerability Intelligence & Human Development Governance Layer for Maharashtra.',
    dataMode: 'Simulated for PoC',
    generatedAt: new Date().toISOString(),
    coverage: { districts: districts.length, blocks: blocks.length, villages: villages.length, schemes: SCHEMES.length, beneficiaryRecords: 10000 + randInt(2000, 6000) },
    compliance: 'AI outputs are decision-support indicators only. Final action remains with authorized government officials through human-in-the-loop review.',
  },
  divisions: DIVISIONS,
  departments: DEPARTMENTS,
  tribalGroups: TRIBAL_GROUPS,
  pvtg: PVTG_GROUPS,
  vulnerabilityCategories: VULNERABILITY_CATEGORIES,
  schemes: SCHEMES,
  districts,
  blocks,
  villages,
  totals: { totalPopulation, totalBeneficiaries, totalExpenditure, totalAllocation },
  MONTHS,
};

// expose helpers for route modules
export const helpers = { rand, randInt, pick, round, series, sum, riskBand, MONTHS };
