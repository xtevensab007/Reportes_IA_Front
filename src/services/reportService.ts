// =============================================
// services/reportService.ts — Servicio de reportes
// =============================================

import api from './api'
import type {
  ApiResponse,
  PaginatedResponse,
  Report,
  ExtractedField,
  DashboardStats,
} from '@/types'

export interface CreateReportPayload {
  name: string
  configuratorId: string
  pdfUploadId: string
  excelUploadId: string
}

export interface UpdateExtractedFieldPayload {
  fieldName: string
  value: string
}

const reportService = {
  // Dashboard stats
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/reports/stats')
    return data.data
  },

  // Listar reportes paginados
  async list(page = 1, pageSize = 10): Promise<PaginatedResponse<Report>> {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Report>>>('/reports', {
    params: { page, pageSize },
  })
  const statusMap: Record<string, string> = {
    'PENDING':    'pending',
    'UPLOADING':  'processing',
    'PROCESSING': 'processing',
    'REVIEWING':  'completed',
    'GENERATING': 'processing',
    'COMPLETED':  'completed',
    'ERROR':      'error',
  }
  data.data.data = data.data.data.map((r) => ({
    ...r,
    status: (statusMap[r.status] || r.status) as Report['status'],
  }))
  return data.data
},

  // Obtener reporte por ID
  async getById(id: string): Promise<Report> {
  const { data } = await api.get<ApiResponse<Report>>(`/reports/${id}`)
  const r = data.data as Report & { extractedFields?: Array<{
    fieldName: string
    value: string
    source: string
    status: string
    confidence: number
  }> }

  // Mapear extractedFields → extractedData
  if (r.extractedFields) {
    r.extractedData = r.extractedFields.map((f) => ({
      fieldName: f.fieldName,
      value: f.value,
      source: f.source.toLowerCase() as 'pdf' | 'excel',
      confidence: f.confidence,
      needsReview: f.status === 'REVIEW',
    }))
  }

  // Normalizar status
  const statusMap: Record<string, string> = {
    'PENDING':    'pending',
    'UPLOADING':  'processing',
    'PROCESSING': 'processing',
    'REVIEWING':  'completed',
    'GENERATING': 'processing',
    'COMPLETED':  'completed',
    'ERROR':      'error',
  }
  r.status = (statusMap[r.status] || r.status) as Report['status']

  return r
},

  // Crear reporte (inicia el procesamiento en el backend)
  async create(payload: CreateReportPayload): Promise<Report> {
    const { data } = await api.post<ApiResponse<Report>>('/reports', payload)
    return data.data
  },

  // Subir archivo PDF o Excel (multipart)
  async uploadFile(
    file: File,
    type: 'pdf' | 'excel',
    onProgress?: (pct: number) => void
  ): Promise<{ uploadId: string; fileName: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type.toUpperCase())

    const { data } = await api.post<ApiResponse<{ uploadId: string; fileName: string }>>(
      '/uploads',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100))
          }
        },
      }
    )
    return data.data
  },

  // Actualizar un campo extraído manualmente
  async updateField(
    reportId: string,
    payload: UpdateExtractedFieldPayload
  ): Promise<ExtractedField[]> {
    const { data } = await api.patch<ApiResponse<ExtractedField[]>>(
      `/reports/${reportId}/fields`,
      payload
    )
    return data.data
  },

  // Generar el PDF final
  async generatePdf(reportId: string): Promise<{ outputUrl: string }> {
    const { data } = await api.post<ApiResponse<{ outputUrl: string }>>(
      `/reports/${reportId}/generate`
    )
    return data.data
  },

  // Descargar el PDF como blob
  async download(reportId: string): Promise<Blob> {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    })
    return response.data as Blob
  },

  // Eliminar reporte
  async delete(id: string): Promise<void> {
    await api.delete(`/reports/${id}`)
  },
}

export default reportService
