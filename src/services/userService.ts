// =============================================
// services/userService.ts — Perfil y cuenta
// =============================================

import api from './api'
import type { ApiResponse, User } from '@/types'

export interface UpdateProfilePayload {
  name: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

const userService = {
  // Actualizar nombre / datos del perfil
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>('/auth/me', payload)
    // Actualizar localStorage para que la sesión refleje el nuevo nombre
    const raw = localStorage.getItem('reportai_user')
    if (raw) {
      const stored = JSON.parse(raw) as User
      localStorage.setItem('reportai_user', JSON.stringify({ ...stored, ...data.data }))
    }
    return data.data
  },

  // Cambiar contraseña
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post('/auth/change-password', payload)
  },

  // Eliminar cuenta (requiere confirmación)
  async deleteAccount(password: string): Promise<void> {
    await api.delete('/auth/me', { data: { password } })
  },
}

export default userService
