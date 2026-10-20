import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import {
  Dashboard,
  DashboardPageLayout,
  EvidencePage,
  ComingSoon,
} from './components/Dashboard';
import { DisputesPage } from './components/Disputes';
import Agreements from './components/Agreements';
import Claims from './components/Claims';
import AgreementView from './components/AgreementView';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/agreements" element={<Agreements />} />
      <Route path="/evidence" element={<EvidencePage />} />
      <Route
        path="/claims"
        element={
          <DashboardPageLayout>
            <Claims />
          </DashboardPageLayout>
        }
      />
      <Route path="/disputes" element={<DisputesPage />} />
      <Route path="/agreement/:id" element={<DashboardPageLayout><AgreementView /></DashboardPageLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </HashRouter>
);
