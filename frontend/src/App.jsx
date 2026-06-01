import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';

import Executive from './pages/Executive.jsx';
import District from './pages/District.jsx';
import Welfare from './pages/Welfare.jsx';
import Education from './pages/Education.jsx';
import Health from './pages/Health.jsx';
import Migration from './pages/Migration.jsx';
import Fra from './pages/Fra.jsx';
import Grievances from './pages/Grievances.jsx';
import Compliance from './pages/Compliance.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Executive />} />
        <Route path="/district" element={<District />} />
        <Route path="/welfare" element={<Welfare />} />
        <Route path="/education" element={<Education />} />
        <Route path="/health" element={<Health />} />
        <Route path="/migration" element={<Migration />} />
        <Route path="/fra" element={<Fra />} />
        <Route path="/grievances" element={<Grievances />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
