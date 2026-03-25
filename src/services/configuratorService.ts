// =============================================
// services/configuratorService.ts
// =============================================

import api from './api'
import type { ApiResponse, Configurator } from '@/types'

const configuratorService = {
  async list(): Promise<Configurator[]> {
    const { data } = await api.get<ApiResponse<Configurator[]>>('/configurators')
    return data.data
  },

  async getById(id: string): Promise<Configurator> {
    const { data } = await api.get<ApiResponse<Configurator>>(`/configurators/${id}`)
    return data.data
  },

  async create(payload: Omit<Configurator, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Configurator> {
    const { data } = await api.post<ApiResponse<Configurator>>('/configurators', payload)
    return data.data
  },

  async update(id: string, payload: Partial<Configurator>): Promise<Configurator> {
    const { data } = await api.put<ApiResponse<Configurator>>(`/configurators/${id}`, payload)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/configurators/${id}`)
  },
}

export default configuratorService
