// =============================================
// pages/RegisterPage.tsx
// =============================================

import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import authService from '@/services/authService'

const RegisterPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirm) {
      toast.error('Completa todos los campos'); return
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres'); return
    }
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden'); return
    }
    setSubmitting(true)
    try {
      await authService.register({ name, email, password })
      toast.success('¡Cuenta creada! Ya puedes ingresar')
      navigate('/login')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Error al registrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: 400,
          boxShadow: 'var(--shadow-md)',
          pointerEvents: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52, height: 52,
              background: 'var(--color-blue-light)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Sparkles size={24} color="var(--color-blue)" />
          </div>
          <h1 style={{ fontSize: '1.375rem', marginBottom: 6 }}>Crear cuenta</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}>
            Regístrate en ReportAI
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: 'absolute', right: 4, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-3)',
                }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              style={{
                borderColor: confirm && confirm !== password ? 'var(--color-red)' : undefined,
              }}
            />
            {confirm && confirm !== password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-red)' }}>
                Las contraseñas no coinciden
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={submitting}
          >
            {submitting
              ? <div className="spinner" style={{ borderTopColor: '#fff' }} />
              : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-2)', marginTop: '1.25rem' }}>
          ¿Ya tienes cuenta?{' '}
          <span
           style={{ color: 'var(--color-blue)', fontWeight: 500, cursor: 'pointer' }}
           onClick={() => navigate('/login')}
            >
    Ingresar
  </span>
</p>
      </div>
    </div>
  )
}

export default RegisterPage