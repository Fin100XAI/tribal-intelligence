import { SimulatedTag } from './ui/States.jsx';

// Standard page heading with audience tag + module description.
export default function PageHeader({ nav, right }) {
  const Icon = nav.icon;
  return (
    <div className="pt-5 pb-1">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <span className="grid place-items-center h-11 w-11 rounded-2xl bg-govblue-900 text-saffron-400 shrink-0">
            <Icon size={22} />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-ink-800 tracking-tight">{nav.label}</h1>
            <p className="text-xs sm:text-[13px] text-ink-400 mt-0.5">{nav.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {right}
          <span className="chip px-2.5 py-1 text-[11px] bg-govblue-50 text-govblue-700 font-medium">{nav.audience}</span>
          <SimulatedTag />
        </div>
      </div>
    </div>
  );
}
