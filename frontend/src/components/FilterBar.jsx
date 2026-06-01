import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { useFilters } from '../context/FilterContext.jsx';
import { InlineSelect } from './ui/Select.jsx';

// Clean, compact, single-row sticky filter bar. Each control is an inline pill;
// active (non-default) filters are highlighted and counted. Wraps cleanly on
// mobile with no overlap. One component → identical design on every page.
export default function FilterBar({ show = ['district', 'division', 'risk', 'date'] }) {
  const { filters, setFilter, resetFilters, options } = useFilters();

  const o = options || {};
  const opt = (all, list) => [{ value: 'all', label: all }, ...(list || [])];
  const map = (list, kv = (x) => ({ value: x, label: x })) => (list || []).map(kv);

  const CONFIG = {
    district: { key: 'district', label: 'District', options: opt('All', map(o.districts, (d) => ({ value: d.id, label: d.name }))), isDefault: (v) => v === 'all' },
    division: { key: 'division', label: 'Division', options: opt('All', map(o.divisions)), isDefault: (v) => v === 'all' },
    department: { key: 'department', label: 'Dept', options: opt('All', map(o.departments)), isDefault: (v) => v === 'all' },
    scheme: { key: 'scheme', label: 'Scheme', options: opt('All', map(o.schemes, (s) => ({ value: s.id, label: s.name }))), isDefault: (v) => v === 'all' },
    tribal: { key: 'tribalGroup', label: 'Tribe', options: opt('All', map(o.tribalGroups)), isDefault: (v) => v === 'all' },
    gender: { key: 'gender', label: 'Gender', options: map(o.genders || ['All', 'Male', 'Female', 'Other']), isDefault: (v) => v === 'All' },
    age: { key: 'ageGroup', label: 'Age', options: opt('All', map(o.ageGroups)), isDefault: (v) => v === 'all' },
    vulnerability: { key: 'vulnerability', label: 'Vulnerability', options: opt('All', map(o.vulnerabilityCategories)), isDefault: (v) => v === 'all' },
    risk: { key: 'risk', label: 'Risk', options: opt('All', map(o.riskLevels)), isDefault: (v) => v === 'all' },
    status: { key: 'status', label: 'Status', options: opt('All', map(o.statuses)), isDefault: (v) => v === 'all' },
  };

  const items = show.filter((s) => s !== 'date').map((s) => CONFIG[s]).filter(Boolean);
  const activeCount =
    items.filter((c) => !c.isDefault(filters[c.key])).length +
    (show.includes('date') && (filters.dateFrom !== '2026-04-01' || filters.dateTo !== '2026-06-01') ? 1 : 0);

  return (
    <div className="sticky top-[60px] z-20 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-2.5 bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 shrink-0">
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-govblue-600 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </span>

        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {items.map((c) => (
            <InlineSelect
              key={c.key}
              label={c.label}
              value={filters[c.key]}
              onChange={(v) => setFilter(c.key, v)}
              options={c.options}
              active={!c.isDefault(filters[c.key])}
            />
          ))}

          {show.includes('date') && (
            <div className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white pl-3 pr-1 py-1 text-xs">
              <span className="text-ink-400">Date</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter('dateFrom', e.target.value)}
                className="bg-transparent font-semibold text-ink-700 focus:outline-none w-[112px]"
              />
              <span className="text-ink-300">–</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter('dateTo', e.target.value)}
                className="bg-transparent font-semibold text-ink-700 focus:outline-none w-[112px]"
              />
            </div>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-200 shrink-0"
          >
            <RotateCcw size={13} /> Reset
            <X size={12} className="opacity-60" />
          </button>
        )}
      </div>
    </div>
  );
}
