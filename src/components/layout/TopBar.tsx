// =============================================
// components/layout/TopBar.tsx
// Barra superior para mobile y breadcrumb en desktop
// =============================================

import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/reports':       'Mis reportes',
  '/reports/new':   'Nuevo reporte',
  '/configurators': 'Configuradores',
  '/settings':      'Ajustes',
}

const TopBar: React.FC = () => {
  const { pathname } = useLocation()
  const label = ROUTE_LABELS[pathname] ?? 'ReportAI'

  return (
    <>
      {/* Mobile top bar (only visible < 768px via CSS) */}
      <div className="topbar-mobile">
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: 'var(--color-blue-light)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={14} color="var(--color-blue)" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>ReportAI</span>
        </Link>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}>{label}</span>
      </div>

      {/* Mobile nav (bottom) */}
      <nav className="bottomnav-mobile">
        {Object.entries(ROUTE_LABELS).map(([path, name]) => (
          <Link
            key={path}
            to={path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 8px',
              fontSize: '0.6875rem',
              color: pathname === path ? 'var(--color-blue)' : 'var(--color-text-3)',
              fontWeight: pathname === path ? 500 : 400,
            }}
          >
            {name}
          </Link>
        ))}
      </nav>
    </>
  )
}

export default TopBar
