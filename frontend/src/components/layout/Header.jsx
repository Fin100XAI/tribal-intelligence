import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, UserCircle2, MapPin } from 'lucide-react';
import { NAV } from '../../nav.js';
import { useFilters } from '../../context/FilterContext.jsx';

export default function Header({ onMenu }) {
  const navigate = useNavigate();
  const { filters, setFilter, options } = useFilters();
  const [q, setQ] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowResults(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = q
    ? NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()) || n.desc.toLowerCase().includes(q.toLowerCase()))
    : [];

  const districtOpts = options?.districts || [];

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="h-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6">
        <button onClick={onMenu} className="lg:hidden grid place-items-center h-9 w-9 rounded-lg text-ink-500 hover:bg-ink-50">
          <Menu size={20} />
        </button>

        {/* Global search */}
        <div ref={boxRef} className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search modules, districts, schemes…"
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 pl-9 pr-3 py-2 text-sm placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-govblue-200 focus:bg-white"
          />
          {showResults && q && (
            <div className="absolute mt-2 w-full rounded-xl border border-ink-100 bg-white shadow-cardhover overflow-hidden max-h-80 overflow-y-auto z-50">
              {results.length === 0 && <p className="px-4 py-3 text-sm text-ink-400">No modules match “{q}”.</p>}
              {results.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.path}
                    onClick={() => {
                      navigate(n.path);
                      setQ('');
                      setShowResults(false);
                    }}
                    className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-govblue-50/50"
                  >
                    <Icon size={16} className="mt-0.5 text-govblue-700 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink-800">{n.label}</span>
                      <span className="block text-xs text-ink-400 truncate">{n.desc}</span>
                    </span>
                  </button>
                );
              })}
              {districtOpts
                .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 4)
                .map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setFilter('district', d.id);
                      navigate('/district');
                      setQ('');
                      setShowResults(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-govblue-50/50 border-t border-ink-50"
                  >
                    <MapPin size={15} className="text-saffron-600 shrink-0" />
                    <span className="text-sm text-ink-700">
                      Open district <span className="font-semibold">{d.name}</span>
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Quick district selector (desktop) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-saffron-600" />
            <select
              value={filters.district}
              onChange={(e) => setFilter('district', e.target.value)}
              className="appearance-none rounded-xl border border-ink-200 bg-white pl-7 pr-7 py-2 text-sm font-medium text-ink-700 focus:outline-none focus:ring-2 focus:ring-govblue-200"
            >
              <option value="all">All Maharashtra</option>
              {districtOpts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-300" />
          </div>
        </div>

        <button className="relative grid place-items-center h-9 w-9 rounded-lg text-ink-500 hover:bg-ink-50" title="Alerts">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-saffron-500 ring-2 ring-white" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl pl-1.5 pr-2 py-1.5 hover:bg-ink-50"
          >
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-govblue-900 text-white text-xs font-bold">CS</span>
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-[13px] font-semibold text-ink-800">Chief Secretary</span>
              <span className="block text-[11px] text-ink-400">Govt. of Maharashtra</span>
            </span>
            <ChevronDown size={14} className="hidden sm:block text-ink-300" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-ink-100 bg-white shadow-cardhover overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-ink-50">
                <p className="text-sm font-semibold text-ink-800">Chief Secretary</p>
                <p className="text-xs text-ink-400">State Tribal Welfare Command</p>
              </div>
              {['Profile & Role', 'Access Scope: State', 'Audit Log', 'Sign Out'].map((item) => (
                <button key={item} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 text-left">
                  <UserCircle2 size={15} className="text-ink-300" />
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
