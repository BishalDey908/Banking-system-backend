import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AccountsPage } from './pages/accounts/AccountsPage';
import { TransfersPage } from './pages/transfers/TransfersPage';
import { ActivityPage } from './pages/activity/ActivityPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { StatisticsPage } from './pages/statistics/StatisticsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { RateLimitBanner } from './components/common/RateLimitBanner';

/**
 * Root Application Router with Landing Page & Protected Banking Shell
 */
export function App() {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const isAuth = Boolean(isAuthenticated || token);

  return (
    <BrowserRouter>
      {/* Global Rate Limit Lockout & Notification */}
      <RateLimitBanner />

      <Routes>
        {/* Public Landing & Authentication Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Root Route: Show Landing Page when unauthenticated, Dashboard when authenticated */}
        <Route
          path="/"
          element={
            isAuth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Protected Core Banking Views */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

