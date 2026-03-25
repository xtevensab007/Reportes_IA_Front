// =============================================
// components/layout/Sidebar.tsx
// =============================================

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FilePlus2,
  FileCheck2,
  Settings2,
  Star,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { to: '/dashboard',       label: 'Dashboard',      icon: <LayoutDashboard size={16} /> },
  { to: '/reports/new',     label: 'Nuevo reporte',  icon: <FilePlus2 size={16} /> },
  { to: '/reports',         label: 'Mis reportes',   icon: <FileCheck2 size={16} /> },
  { to: '/configurators',   label: 'Configuradores', icon: <Star size={16} /> },
  { to: '/settings',        label: 'Ajustes',        icon: <Settings2 size={16} /> },
]

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--color-surface)',
        borderRight: '0.5px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.25rem 1rem',
          borderBottom: '0.5px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: 'var(--color-blue-light)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={16} color="var(--color-blue)" />
        </div>
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
          ReportAI
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: isActive ? 'var(--color-blue)' : 'var(--color-text-2)',
              background: isActive ? 'var(--color-blue-light)' : 'transparent',
              transition: 'background var(--transition), color var(--transition)',
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              if (!el.classList.contains('active')) {
                el.style.background = 'var(--color-surface-2)'
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              if (!el.style.color.includes('blue')) {
                el.style.background = 'transparent'
              }
            }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          borderTop: '0.5px solid var(--color-border)',
          padding: '0.75rem 1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#E1F5EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: '#0F6E56',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--color-text-1)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', gap: 8, fontSize: '0.8125rem' }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
