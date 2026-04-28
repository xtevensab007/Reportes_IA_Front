// =============================================
// context/AuthContext.tsx
// =============================================

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import type { AuthState, User, AuthTokens } from '@/types'
import authService from '@/services/authService'
import { getStoredTokens, clearTokens } from '@/services/api'

// ---- Actions ----
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'UPDATE_USER':
      return { ...state, user: action.payload }
    default:
      return state
  }
}

// ---- Context ----
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  loginWithGithub: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restaurar sesión al montar
  useEffect(() => {
    const restore = async () => {
      const tokens = getStoredTokens()
      const rawUser = localStorage.getItem('reportai_user')

      if (!tokens || !rawUser) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        const user = await authService.getProfile()
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } })
      } catch {
        clearTokens()
        dispatch({ type: 'LOGOUT' })
      }
    }
    restore()
  }, [])

/*
useEffect(() => {
  // MOCK temporal — quitar cuando el backend esté listo
  dispatch({
    type: 'LOGIN_SUCCESS',
    payload: {
      user: {
        id: '1',
        name: 'Steven Alipio',
        email: 'SAB@empresa.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        expiresIn: 3600,
      },
    },
  })
}, [])
*/
  const login = useCallback(async (email: string, password: string) => {
  const { user, tokens } = await authService.login({ email, password })
  dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } })
}, [])

  const loginWithGoogle = useCallback(() => authService.loginWithGoogle(), [])
  const loginWithGithub = useCallback(() => authService.loginWithGithub(), [])

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, login, loginWithGoogle, loginWithGithub, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
