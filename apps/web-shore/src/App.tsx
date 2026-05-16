import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@fleetops/ui-kit';
import { useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ComponentsPage } from './pages/ComponentsPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { JobInstancesPage } from './pages/JobInstancesPage.js';
import { PurchasePage } from './pages/PurchasePage.js';
import { ComingSoonPage } from './pages/ComingSoonPage.js';

const NAV = [
  { label: 'Start', href: '/dashboard', code: 'ST' },
  { label: 'Maintenance', href: '/components', code: 'MA' },
  { label: 'Jobs', href: '/jobs', code: 'JB' },
  { label: 'Inventory', href: '/inventory', code: 'IN' },
  { label: 'Purchase', href: '/purchase', code: 'PO' },
  { label: 'Certificates', href: '/certificates', code: 'CR' },
  { label: 'Safety', href: '/safety', code: 'SF' },
  { label: 'QHSE', href: '/qhse', code: 'QH' },
  { label: 'Crewing', href: '/crewing', code: 'CW' },
  { label: 'FLGO', href: '/flgo', code: 'FL' },
];

function ProtectedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AppShell
      nav={NAV}
      currentPath={location.pathname}
      onNavClick={(href) => navigate(href)}
      userEmail={user.email}
      onLogout={logout}
    >
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="components" element={<ComponentsPage />} />
        <Route path="jobs" element={<JobInstancesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="purchase" element={<PurchasePage />} />
        <Route
          path="certificates"
          element={<ComingSoonPage module="Certificates" phase="Phase 2 (P2-1)" />}
        />
        <Route path="safety" element={<ComingSoonPage module="Safety" phase="Phase 2 (P2-2)" />} />
        <Route path="qhse" element={<ComingSoonPage module="QHSE" phase="Phase 2 (P2-3)" />} />
        <Route
          path="crewing"
          element={<ComingSoonPage module="Crewing" phase="Phase 2 (P2-4)" />}
        />
        <Route path="flgo" element={<ComingSoonPage module="FLGO" phase="Phase 3 (P3-1)" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
