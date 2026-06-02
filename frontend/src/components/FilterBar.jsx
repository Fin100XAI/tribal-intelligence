import { useState } from 'react';
import { SlidersHorizontal, RotateCcw, X, Check, ChevronDown } from 'lucide-react';
import { useFilters } from '../context/FilterContext.jsx';

// Premium filter toolbar: a clean labelled dropdown row + a row of removable
// active-filter chips so it's always obvious what is applied. One shared
// component → identical design on every page. Every control drives the data.
export default function FilterBar({ show = ['district', 'division', 'risk', 'date'] }) {
  const { filters, setFilter, resetFilters, options } = useFilters();
  const [open, setOpen] = useState(true);

  const o = options || {};
  const opt = (all, list) => [{ value: 'all', label: all }, ...(list || [])];
  const map = (list, kv = (x) => ({ value: x, label: x })) => (list || []).map(kv);

  const CONFIG = {
    district: { key: 'district', label: 'District', def: 'all', options: opt('All Districts', map(o.districts, (d) => ({ value: d.id, label: d.name }))) },
    division: { key: 'division', label: 'Division', def: 'all', options: opt('All Divisions', map(o.divisions)) },
    department: { key: 'department', label: 'Department', def: 'all', options: opt('All Departments', map(o.departments)) },
    scheme: { key: 'scheme', label: 'Scheme', def: 'all', options: opt('All Schemes', map(o.schemes, (s) => ({ value: s.id, label: s.name }))) },
    tribal: { key: 'tribalGroup', label: 'Tribal Group', def: 'all', options: opt('All Tribal Groups', map(o.tribalGroups)) },
    gender: { key: 'gender', label: 'Gender', def: 'All', options: map(o.genders || ['All', 'Male', 'Female', 'Other']) },
    age: { key: 'ageGroup', label: 'Age Group', def: 'all', options: opt('All Ages', map(o.ageGroups)) },
    vulnerability: { key: 'vulnerability', label: 'Vulnerability', def: 'all', options: opt('All Vulnerability', map(o.vulnerabilityCategories)) },
    risk: { key: 'risk', label: 'Risk Level', def: 'all', options: opt('All Risk Levels', map(o.riskLevels)) },
    status: { key: 'status', label: 'Status', def: 'all', options: opt('All Status', map(o.statuses)) },
  };

  const items = show.filter((s) => s !== 'date').map((s) => CONFIG[s]).filter(Boolean);
  const labelFor = (c, v) => c.options.find((opt) => opt.value === v)?.label ?? v;
  const dateActive = show.includes('date') && (filters.dateFrom !== '2026-04-01' || filters.dateTo !== '2026-06-01');

  const active = items.filter((c) => filters[c.key] !== c.def);
  const activeCount = active.length + (dateActive ? 1 : 0);

  return (
    <div className="sticky top-[60px] z-20 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-3 bg-white/95 backdrop-blur border-b border-ink-100">
      {/* header row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-govblue-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-govblue-800"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeCount > 0 && (
            <span className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-saffron-500 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* active chips (inline, scrollable) */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {activeCount === 0 ? (
            <span className="text-xs text-ink-400">No filters applied — showing all data</span>
          ) : (
            <>
              {active.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key, c.def)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-govblue-50 text-govblue-800 ring-1 ring-govblue-200 pl-2.5 pr-2 py-1 text-xs font-medium whitespace-nowrap shrink-0 hover:bg-govblue-100"
                  title="Remove filter"
                >
                  <span className="text-govblue-400">{c.label}:</span>
                  {labelFor(c, filters[c.key])}
                  <X size={12} className="opacity-60 group-hover:opacity-100" />
                </button>
              ))}
              {dateActive && (
                <button
                  onClick={() => {
                    setFilter('dateFrom', '2026-04-01');
                    setFilter('dateTo', '2026-06-01');
                  }}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-govblue-50 text-govblue-800 ring-1 ring-govblue-200 pl-2.5 pr-2 py-1 text-xs font-medium whitespace-nowrap shrink-0 hover:bg-govblue-100"
                >
                  <span className="text-govblue-400">Date:</span>
                  {filters.dateFrom} → {filters.dateTo}
                  <X size={12} className="opacity-60 group-hover:opacity-100" />
                </button>
              )}
            </>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 shrink-0"
          >
            <RotateCcw size={13} /> <span className="hidden sm:inline">Clear all</span>
          </button>
        )}
      </div>

      {/* dropdown grid */}
      {open && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 animate-fadein">
          {items.map((c) => {
            const isActive = filters[c.key] !== c.def;
            return (
              <label key={c.key} className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400 flex items-center gap-1">
                  {c.label}
                  {isActive && <Check size={11} className="text-emerald-600" />}
                </span>
                <div className="relative">
                  <select
                    value={filters[c.key]}
                    onChange={(e) => setFilter(c.key, e.target.value)}
                    className={`w-full appearance-none rounded-lg border pl-3 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-govblue-200 transition-colors ${
                      isActive ? 'border-govblue-300 bg-govblue-50/60 text-govblue-800' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    {c.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
                </div>
              </label>
            );
          })}

          {show.includes('date') && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Date From</span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilter('dateFrom', e.target.value)}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 focus:outline-none focus:ring-2 focus:ring-govblue-200"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Date To</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilter('dateTo', e.target.value)}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 focus:outline-none focus:ring-2 focus:ring-govblue-200"
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}
