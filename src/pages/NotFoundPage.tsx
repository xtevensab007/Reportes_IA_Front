// =============================================
// pages/NotFoundPage.tsx
// =============================================

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Frown, Home } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--color-bg)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <Frown size={52} color="var(--color-text-3)" />
      <h1 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-text-3)', lineHeight: 1 }}>
        404
      </h1>
      <p style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--color-text-1)' }}>
        Página no encontrada
      </p>
      <p style={{ color: 'var(--color-text-2)', maxWidth: 360 }}>
        La ruta que buscas no existe o fue movida.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/dashboard')}
        style={{ marginTop: 8 }}
      >
        <Home size={16} /> Ir al dashboard
      </button>
    </div>
  )
}

export default NotFoundPage
