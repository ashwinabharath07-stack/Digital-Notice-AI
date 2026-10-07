import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Login from '@/pages/Login';
import DashboardHome from '@/pages/DashboardHome';
import Notices from '@/pages/Notices';
import CreateNotice from '@/pages/CreateNotice';
import MyNotices from '@/pages/MyNotices';
import Events from '@/pages/Events';
import type { UserRole } from '@/types';

function RoleRedirect() {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Navigate to={`/dashboard/${profile.role}`} replace />;
}

function DashboardRoute({ role }: { role: UserRole }) {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      <DashboardLayout>
        <DashboardHome role={role} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Role-based dashboards */}
      <Route path="/dashboard/student" element={<DashboardRoute role="student" />} />
      <Route path="/dashboard/faculty" element={<DashboardRoute role="faculty" />} />
      <Route path="/dashboard/parent" element={<DashboardRoute role="parent" />} />

      {/* Shared pages — wrapped with auth + layout */}
      <Route path="/notices" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Notices />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/notices/create" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <DashboardLayout>
            <CreateNotice />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/notices/mine" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <DashboardLayout>
            <MyNotices />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Events />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Root redirect */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Catch-all */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
