// =============================================
// pages/ReportsPage.tsx — COMPLETO
// =============================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2, Download, Trash2, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { useReportList } from '@/hooks/useReports'
import { useDebounce, usePageTitle } from '@/hooks/useUtils'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageHeader from '@/components/ui/PageHeader'
import type { Report, ReportStatus } from '@/types'
import { formatDate, statusLabel, statusColor, downloadBlob } from '@/utils'
import reportService from '@/services/reportService'

const STATUS_FILTERS: { label: string; value: ReportStatus | 'all' }[] = [
  { label: 'Todos',       value: 'all' },
  { label: 'Completado',  value: 'completed' },
  { label: 'Procesando',  value: 'processing' },
  { label: 'Pendiente',   value: 'pending' },
  { label: 'Error',       value: 'error' },
]

const PAGE_SIZE = 10

const ReportsPage: React.FC = () => {
  usePageTitle('Mis reportes')
  const navigate  = useNavigate()

  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState<ReportStatus | 'all'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)
  const [deleting, setDeleting]       = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { reports, totalPages, loading, remove } = useReportList(page, PAGE_SIZE)

  // Client-side filter (search + status)
  const filtered = reports.filter((r) => {
    const matchSearch =
      !debouncedSearch ||
      r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.configuratorName.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDownload = async (r: Report) => {
    setDownloadingId(r.id)
    try {
      const blob = await reportService.download(r.id)
      downloadBlob(blob, `${r.name}.pdf`)
    } catch {
      toast.error('Error al descargar')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await remove(deleteTarget.id)
      toast.success('Reporte eliminado')
      setDeleteTarget(null)
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-container fade-in">
      <PageHeader
        title="Mis reportes"
        subtitle="Historial completo de reportes generados"
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/reports/new')}>
            <FilePlus2 size={16} /> Nuevo reporte
          </button>
        }
      />

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }}
          />
          <input
            className="form-input"
            placeholder="Buscar por nombre o configurador…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`btn btn-sm ${statusFilter === f.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatus(f.value); setPage(1) }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-3)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          Cargando reportes…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={search || statusFilter !== 'all' ? 'Ningún reporte coincide con los filtros actuales.' : 'Aún no has creado ningún reporte.'}
          action={
            search || statusFilter !== 'all'
              ? <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatus('all') }}>Limpiar filtros</button>
              : <button className="btn btn-primary" onClick={() => navigate('/reports/new')}><FilePlus2 size={16} /> Crear reporte</button>
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Configurador</th>
                <th>Archivos</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/reports/${r.id}`)}
                >
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td style={{ color: 'var(--color-text-2)' }}>{r.configuratorName}</td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    <div style={{ color: 'var(--color-text-2)' }}>{r.pdfFileName}</div>
                    <div style={{ color: 'var(--color-text-3)' }}>{r.excelFileName}</div>
                  </td>
                  <td style={{ color: 'var(--color-text-2)', whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                  <td>
                    <Badge variant={statusColor[r.status] as 'green' | 'amber' | 'red' | 'blue' | 'gray'}>
                      {statusLabel[r.status]}
                    </Badge>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Ver detalle"
                        onClick={() => navigate(`/reports/${r.id}`)}
                      >
                        <ExternalLink size={13} />
                      </button>
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
                        style={{ color: 'var(--color-red)' }}
                        title="Eliminar"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: '1.5rem' }}>
          <button
            className="btn btn-secondary btn-sm btn-icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}>
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </span>
          <button
            className="btn btn-secondary btn-sm btn-icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar reporte"
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default ReportsPage
