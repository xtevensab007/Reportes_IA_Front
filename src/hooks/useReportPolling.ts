// =============================================
// hooks/useReportPolling.ts
// Sondea el backend cada N segundos hasta que el reporte esté listo
// =============================================

import { useState, useEffect, useRef } from 'react'
import reportService from '@/services/reportService'
import type { Report, ReportStatus } from '@/types'

interface Options {
  reportId: string | null
  /** Sondea mientras el estado sea uno de estos */
  activeStatuses?: ReportStatus[]
  intervalMs?: number
  onDone?: (report: Report) => void
  onError?: (report: Report) => void
}

export const useReportPolling = ({
  reportId,
  activeStatuses = ['pending', 'processing'],
  intervalMs = 2500,
  onDone,
  onError,
}: Options) => {
  const [report, setReport]   = useState<Report | null>(null)
  const [polling, setPolling] = useState(false)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef             = useRef(false)

  const stop = () => {
    activeRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    setPolling(false)
  }

  useEffect(() => {
    if (!reportId) return
    activeRef.current = true
    setPolling(true)

    const tick = async () => {
      if (!activeRef.current) return
      try {
        const r = await reportService.getById(reportId)
        setReport(r)

        if (activeStatuses.includes(r.status)) {
          timerRef.current = setTimeout(tick, intervalMs)
        } else {
          setPolling(false)
          if (r.status === 'completed') onDone?.(r)
          if (r.status === 'error')     onError?.(r)
        }
      } catch {
        // Network glitch — retry
        if (activeRef.current) timerRef.current = setTimeout(tick, intervalMs * 2)
      }
    }

    tick()
    return stop
  }, [reportId])

  return { report, polling, stop }
}
