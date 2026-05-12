// =============================================
// App.tsx — Router principal
// =============================================

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'

// Lazy load pages
const LoginPage               = lazy(() => import('@/pages/LoginPage'))
const OAuthCallbackPage       = lazy(() => import('@/pages/OAuthCallbackPage'))
const DashboardPage           = lazy(() => import('@/pages/DashboardPage'))
const NewReportPage           = lazy(() => import('@/pages/NewReportPage'))
const ReportsPage             = lazy(() => import('@/pages/ReportsPage'))
const ReportDetailPage        = lazy(() => import('@/pages/ReportDetailPage'))
const ConfiguratorsPage       = lazy(() => import('@/pages/ConfiguratorsPage'))
const ConfiguratorFormPage    = lazy(() => import('@/pages/ConfiguratorFormPage'))
const SettingsPage            = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage            = lazy(() => import('@/pages/NotFoundPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))

const Fallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
    <div className="spinner" style={{ width: 28, height: 28 }} />
    <p style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>Cargando…</p>
  </div>
)

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius-md)',
            border: '0.5px solid var(--color-border)',
          },
          success: { iconTheme: { primary: 'var(--color-green)', secondary: '#fff' } },
          error:   { iconTheme: { primary: 'var(--color-red)',   secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback/:provider" element={<OAuthCallbackPage />} />
          <Route path="/register"                 element={<RegisterPage />} />

          {/* Protected routes inside layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"                element={<DashboardPage />} />
            <Route path="/reports"                  element={<ReportsPage />} />
            <Route path="/reports/new"              element={<NewReportPage />} />
            <Route path="/reports/:id"              element={<ReportDetailPage />} />
            <Route path="/configurators"            element={<ConfiguratorsPage />} />
            <Route path="/configurators/new"        element={<ConfiguratorFormPage />} />
            <Route path="/configurators/:id/edit"   element={<ConfiguratorFormPage />} />
            <Route path="/settings"                 element={<SettingsPage />} />
            
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  </BrowserRouter>
)

export default App
