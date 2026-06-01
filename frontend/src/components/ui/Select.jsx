import { ChevronDown } from 'lucide-react';

// Compact inline pill: "Label: value" in one rounded control. Active (non-"all")
// selections are highlighted. Used by the redesigned FilterBar.
export function InlineSelect({ label, value, onChange, options, active }) {
  return (
    <div
      className={`relative inline-flex items-center rounded-full border text-xs font-medium transition-colors ${
        active ? 'border-govblue-300 bg-govblue-50 text-govblue-800' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
      }`}
    >
      <span className={`pl-3 pr-1 py-1.5 ${active ? 'text-govblue-500' : 'text-ink-400'}`}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-7 py-1.5 font-semibold focus:outline-none cursor-pointer"
      >
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const lbl = typeof o === 'string' ? o : o.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60" />
    </div>
  );
}

// Native select styled as a compact pill — reliable on mobile, no overlap.
export default function Select({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-[11px] font-medium text-ink-400 uppercase tracking-wide">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-ink-200 bg-white pl-3 pr-8 py-2 text-sm font-medium text-ink-700 focus:outline-none focus:ring-2 focus:ring-govblue-200 focus:border-govblue-300 hover:border-ink-300 transition-colors"
        >
          {options.map((o) => {
            const val = typeof o === 'string' ? o : o.value;
            const lbl = typeof o === 'string' ? o : o.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
      </div>
    </label>
  );
}
