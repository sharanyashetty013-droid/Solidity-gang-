import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { Dashboard } from './components/Dashboard';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </HashRouter>
);