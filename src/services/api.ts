// =============================================
// services/api.ts — Cliente HTTP centralizado
// =============================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError, AuthTokens } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Instancia principal
const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---- Request interceptor: adjunta el token ----
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getStoredTokens()
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---- Response interceptor: maneja 401 y refresca token ----
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const tokens = getStoredTokens()
        if (!tokens?.refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post<{ data: AuthTokens }>(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        )

        storeTokens(data.data)
        processQueue(null, data.data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const apiError: ApiError = {
      message: (error.response?.data as { message?: string })?.message || 'Error inesperado',
      code: (error.response?.data as { code?: string })?.code || 'UNKNOWN',
      statusCode: error.response?.status || 500,
    }

    return Promise.reject(apiError)
  }
)

// ---- Token helpers ----
export const getStoredTokens = (): AuthTokens | null => {
  try {
    const raw = localStorage.getItem('reportai_tokens')
    return raw ? (JSON.parse(raw) as AuthTokens) : null
  } catch {
    return null
  }
}

export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('reportai_tokens', JSON.stringify(tokens))
}

export const clearTokens = (): void => {
  localStorage.removeItem('reportai_tokens')
  localStorage.removeItem('reportai_user')
}

export default api
