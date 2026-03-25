// =============================================
// services/authService.ts — Servicio de autenticación
// =============================================

import api, { storeTokens, clearTokens } from './api'
import type { ApiResponse, AuthTokens, User } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

const authService = {
  // Login con email / password
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    storeTokens(data.data.tokens)
    localStorage.setItem('reportai_user', JSON.stringify(data.data.user))
    return data.data
  },

  // Redirige al proveedor OAuth
  loginWithGoogle(): void {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/callback/google`
    const scope = 'openid email profile'
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}`
    window.location.href = url
  },

  loginWithGithub(): void {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/callback/github`
    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user:email`
    window.location.href = url
  },

  // Intercambia el code OAuth por tokens (lo procesa el backend)
  async handleOAuthCallback(provider: 'google' | 'github', code: string): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>(`/auth/oauth/${provider}`, {
      code,
      redirectUri: `${window.location.origin}/auth/callback/${provider}`,
    })
    storeTokens(data.data.tokens)
    localStorage.setItem('reportai_user', JSON.stringify(data.data.user))
    return data.data
  },

  // Obtiene perfil actual
  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    return data.data
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      clearTokens()
    }
  },
}

export default authService
