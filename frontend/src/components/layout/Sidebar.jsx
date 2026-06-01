import { NavLink } from 'react-router-dom';
import { X, ShieldCheck } from 'lucide-react';
import { NAV } from '../../nav.js';

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid place-items-center h-9 w-9 rounded-xl bg-govblue-900 shrink-0">
        <ShieldCheck size={20} className="text-saffron-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-ink-800 leading-tight truncate">Maha Tribal</p>
        <p className="text-[11px] font-semibold text-saffron-600 leading-tight">Intelligence Grid</p>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const linkContent = (n) => {
    const Icon = n.icon;
    return (
      <>
        <Icon size={18} className="shrink-0" />
        <span className="truncate">{n.label}</span>
      </>
    );
  };

  const navClass = ({ isActive }) =>
    `nav-link ${
      isActive
        ? 'bg-govblue-50 text-govblue-800 ring-1 ring-govblue-100'
        : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
    }`;

  const inner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 h-[60px] border-b border-ink-100">
        <Brand />
        <button onClick={onClose} className="lg:hidden grid place-items-center h-8 w-8 rounded-lg text-ink-400 hover:bg-ink-50">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-300">Intelligence Modules</p>
        {NAV.map((n) => (
          <NavLink key={n.path} to={n.path} end={n.path === '/'} className={navClass} onClick={onClose}>
            {linkContent(n)}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-ink-100">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck size={13} /> Human-in-the-Loop
          </p>
          <p className="mt-1 text-[10.5px] leading-snug text-emerald-700">
            AI outputs are decision-support indicators only. Final action rests with authorized officials.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-ink-100 z-30">
        {inner}
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-ink-900/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[80%] max-w-xs bg-white shadow-cardhover transition-transform duration-200 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {inner}
        </aside>
      </div>
    </>
  );
}
