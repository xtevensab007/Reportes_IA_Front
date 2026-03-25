// =============================================
// hooks/useReports.ts
// =============================================

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import reportService from '@/services/reportService'
import type { Report, DashboardStats } from '@/types'

// ---- useReportList ----
export const useReportList = (page = 1, pageSize = 10) => {
  const [reports, setReports]       = useState<Report[]>([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await reportService.list(page, pageSize)
      setReports(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al cargar reportes'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => { fetch() }, [fetch])

  const remove = useCallback(
    async (id: string) => {
      await reportService.delete(id)
      setReports((prev) => prev.filter((r) => r.id !== id))
      setTotal((t) => t - 1)
    },
    []
  )

  return { reports, total, totalPages, loading, error, refetch: fetch, remove }
}

// ---- useDashboardStats ----
export const useDashboardStats = () => {
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await reportService.getStats()
      setStats(data)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al cargar estadísticas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats, loading, error, refetch: fetch }
}

// ---- useReport (single) ----
export const useReport = (id: string | null) => {
  const [report, setReport]   = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await reportService.getById(id)
      setReport(data)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error al cargar reporte'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  return { report, loading, error, refetch: fetch }
}
