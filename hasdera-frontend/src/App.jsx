/**
 * App.jsx
 * קומפוננט ראשי עם כל ה-Routing לאזור הניהול
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import IssuesManagement from './components/IssuesManagement';
import AdSlotsManagement from './components/AdSlotsManagement';
import AdvertisersManagement from './components/AdvertisersManagement';
import PaymentsManagement from './components/PaymentsManagement';
import ContentManagement from './components/ContentManagement';
import AnalyticsManagement from './components/AnalyticsManagement';
import UsersManagement from './components/UsersManagement';
import InfrastructureManagement from './components/InfrastructureManagement';
import IntegrationsManagement from './components/IntegrationsManagement';
import Analytics from './components/Analytics';
import HasderaChat from './components/HasderaChat';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* דף בית - מפנה לדשבורד ניהול */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* דשבורד ניהול ראשי */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ניהול גליונות */}
        <Route path="/admin/issues" element={<IssuesManagement />} />

        {/* ניהול מקומות פרסום */}
        <Route path="/admin/ad-slots" element={<AdSlotsManagement />} />

        {/* ניהול מפרסמים */}
        <Route path="/admin/advertisers" element={<AdvertisersManagement />} />

        {/* מערכת תשלומים וגבייה */}
        <Route path="/admin/payments" element={<PaymentsManagement />} />

        {/* מערכת תוכן (CMS) */}
        <Route path="/admin/content" element={<ContentManagement />} />

        {/* מערכת אנליטיקות */}
        <Route path="/admin/analytics" element={<AnalyticsManagement />} />

        {/* משתמשים והרשאות */}
        <Route path="/admin/users" element={<UsersManagement />} />

        {/* תשתית ודוחות מערכת */}
        <Route path="/admin/infrastructure" element={<InfrastructureManagement />} />

        {/* אזור התממשקות */}
        <Route path="/admin/integrations" element={<IntegrationsManagement />} />

        {/* Routes ישנים לשמירה על תאימות */}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/chat" element={<HasderaChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
