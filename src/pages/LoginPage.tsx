// =============================================
// pages/LoginPage.tsx
// =============================================

import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
  </svg>
)

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.57C20.57 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/>
  </svg>
)

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login, loginWithGoogle, loginWithGithub } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) return <Navigate to={from} replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('enviando:', email, password)
    if (!email || !password) { toast.error('Completa todos los campos'); return }
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success('¡Bienvenido!')
      navigate(from, { replace: true })
    } catch (err: unknown) {
  console.log('error completo:', JSON.stringify(err))
  console.log('error mensaje:', (err as { message?: string })?.message)
  toast.error((err as { message?: string })?.message || 'Credenciales inválidas')
} finally {
      setSubmitting(false)
    }
  }
  console.log('isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)
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
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: 'var(--color-blue-light)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Sparkles size={24} color="var(--color-blue)" />
          </div>
          <h1 style={{ fontSize: '1.375rem', marginBottom: 6 }}>ReportAI</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}>
            Plataforma de generación de reportes con IA
          </p>
        </div>

        {/* OAuth buttons */}
        {/*<div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'center', width: '100%' }}
            onClick={loginWithGoogle}
          >
            <GoogleIcon /> Continuar con Google
          </button>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'center', width: '100%' }}
            onClick={loginWithGithub}
          >
            <GithubIcon /> Continuar con GitHub
          </button>
        </div>

        <div className="divider" style={{ marginBottom: '1.25rem' }}>
          o con email
        </div>*/}

        {/* Form */}
        <form onSubmit={handleSubmit} method="post" action="#" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={submitting}
          >
            {submitting ? <div className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-3)', marginTop: '1.25rem' }}>
          Al ingresar aceptas los términos de uso y política de privacidad
        </p>
      </div>
    </div>
  )
}

export default LoginPage
