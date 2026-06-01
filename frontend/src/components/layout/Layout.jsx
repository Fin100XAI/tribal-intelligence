import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout({ children }) {
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-ink-50/40">
      <Sidebar open={drawer} onClose={() => setDrawer(false)} />
      <div className="lg:pl-64">
        <Header onMenu={() => setDrawer(true)} />
        <main key={location.pathname} className="px-3 sm:px-4 lg:px-6 pb-16 animate-fadein">
          {children}
        </main>
        <footer className="lg:pl-0 px-3 sm:px-4 lg:px-6 py-5 border-t border-ink-100 text-[11px] text-ink-400">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p>
              <span className="font-semibold text-ink-500">Maha Tribal Intelligence Grid</span> · Tribal Development Department,
              Govt. of Maharashtra · Powered by MahaIT
            </p>
            <p>AI outputs are decision-support indicators only · Human-in-the-loop governed · Simulated for PoC</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
