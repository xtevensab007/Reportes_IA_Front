// =============================================
// components/auth/ProtectedRoute.tsx
// =============================================

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface Props {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 12,
          flexDirection: 'column',
        }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <p style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>Cargando…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
