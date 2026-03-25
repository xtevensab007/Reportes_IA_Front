// =============================================
// pages/DashboardPage.tsx — COMPLETO
// =============================================

import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2, Download, Trash2, RefreshCw, ArrowRight, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useDashboardStats, useReportList } from '@/hooks/useReports'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import type { Report } from '@/types'
import { formatDate, statusLabel, statusColor, downloadBlob } from '@/utils'
import { usePageTitle } from '@/hooks/useUtils'
import reportService from '@/services/reportService'

const DashboardPage: React.FC = () => {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const navigate = useNavigate()

  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats()
  const { reports, loading: reportsLoading, refetch: refetchReports, remove } = useReportList(1, 8)

  const [downloadingId, setDownloadingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId]       = React.useState<string | null>(null)

  // Auto-poll dashboard every 15s if any report is in-progress
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    const hasActive = reports.some((r) => r.status === 'processing' || r.status === 'pending')
    if (hasActive) {
      pollRef.current = setInterval(() => { refetchReports(); refetchStats() }, 8000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [reports])

  const handleRefresh = () => { refetchStats(); refetchReports() }

  const handleDownload = async (r: Report) => {
    setDownloadingId(r.id)
    try {
      const blob = await reportService.download(r.id)
      downloadBlob(blob, `${r.name}.pdf`)
    } catch {
      toast.error('Error al descargar el reporte')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (r: Report) => {
    if (!confirm(`¿Eliminar "${r.name}"?`)) return
    setDeletingId(r.id)
    try {
      await remove(r.id)
      refetchStats()
      toast.success('Reporte eliminado')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  const isLoading = statsLoading || reportsLoading

  return (
    <div className="page-container fade-in">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--color-text-2)', marginTop: 4 }}>
            Bienvenido de nuevo, <strong>{user?.name?.split(' ')[0]}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw size={13} style={isLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
            Actualizar
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/reports/new')}>
            <FilePlus2 size={16} /> Nuevo reporte
          </button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: '2rem' }}>
        {statsLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="metric-card" style={{ height: 88 }}>
                <div style={{ height: 12, background: 'var(--color-border)', borderRadius: 4, marginBottom: 12, width: '60%' }} />
                <div style={{ height: 28, background: 'var(--color-border)', borderRadius: 4, width: '40%' }} />
              </div>
            ))
          : (
            <>
              <div className="metric-card">
                <p className="metric-label">Total reportes</p>
                <p className="metric-value">{stats?.totalReports ?? 0}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Este mes</p>
                <p className="metric-value">{stats?.thisMonth ?? 0}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Configuradores</p>
                <p className="metric-value">{stats?.configurators ?? 0}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">En proceso</p>
                <p className="metric-value blue">{stats?.inProgress ?? 0}</p>
              </div>
            </>
          )}
      </div>

      {/* ── In-progress banner ── */}
      {!reportsLoading && reports.some((r) => r.status === 'processing' || r.status === 'pending') && (
        <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
          <Clock size={15} />
          <span>
            {reports.filter((r) => r.status === 'processing' || r.status === 'pending').length} reporte(s) en proceso.
            La tabla se actualiza automáticamente cada 8 segundos.
          </span>
        </div>
      )}

      {/* ── Recent reports ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2>Reportes recientes</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')} style={{ color: 'var(--color-blue)' }}>
          Ver todos <ArrowRight size={13} />
        </button>
      </div>

      {reportsLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-3)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          Cargando reportes…
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No hay reportes aún"
          description="Crea tu primer reporte subiendo un PDF y un Excel."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/reports/new')}>
              <FilePlus2 size={16} /> Crear primer reporte
            </button>
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Configurador</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/reports/${r.id}`)}
                >
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td style={{ color: 'var(--color-text-2)' }}>{r.configuratorName}</td>
                  <td style={{ color: 'var(--color-text-2)' }}>{formatDate(r.createdAt)}</td>
                  <td>
                    <Badge variant={statusColor[r.status] as 'green' | 'amber' | 'red' | 'blue' | 'gray'}>
                      {statusLabel[r.status]}
                    </Badge>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {r.status === 'completed' && (
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Descargar PDF"
                          onClick={() => handleDownload(r)}
                          disabled={downloadingId === r.id}
                        >
                          {downloadingId === r.id
                            ? <div className="spinner" style={{ width: 13, height: 13 }} />
                            : <Download size={13} />}
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Eliminar"
                        onClick={() => handleDelete(r)}
                        disabled={deletingId === r.id}
                        style={{ color: 'var(--color-red)' }}
                      >
                        {deletingId === r.id
                          ? <div className="spinner" style={{ width: 13, height: 13 }} />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
