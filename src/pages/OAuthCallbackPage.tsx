// =============================================
// pages/OAuthCallbackPage.tsx
// =============================================

import React, { useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import authService from '@/services/authService'
import { useAuth } from '@/context/AuthContext'

// This page handles the redirect back from Google / GitHub
const OAuthCallbackPage: React.FC = () => {
  const { provider } = useParams<{ provider: 'google' | 'github' }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = searchParams.get('code')
    if (!code || !provider) {
      toast.error('Callback OAuth inválido')
      navigate('/login')
      return
    }

    authService
      .handleOAuthCallback(provider as 'google' | 'github', code)
      .then(() => {
        toast.success('¡Bienvenido!')
        navigate('/dashboard', { replace: true })
      })
      .catch((err: unknown) => {
        toast.error((err as { message?: string })?.message || 'Error al autenticar')
        navigate('/login')
      })
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>Autenticando…</p>
    </div>
  )
}

export default OAuthCallbackPage
