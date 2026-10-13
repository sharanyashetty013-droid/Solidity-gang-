import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import {
  Dashboard,
  DashboardPageLayout,
  EvidencePage,
  ComingSoon,
} from './components/Dashboard';
import Agreements from './components/Agreements';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<Dashboard />} />
     <Route path="/agreements" element={<Agreements />} />
      <Route path="/evidence" element={<EvidencePage />} />
      <Route path="/claims" element={<ComingSoon title="Claims" />} />
      <Route path="/disputes" element={<ComingSoon title="Disputes" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </HashRouter>
);

