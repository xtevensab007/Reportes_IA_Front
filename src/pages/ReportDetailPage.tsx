// =============================================
// pages/ReportDetailPage.tsx
// =============================================

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import reportService from '@/services/reportService'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageHeader from '@/components/ui/PageHeader'
import { useReportPolling } from '@/hooks/useReportPolling'
import type { Report } from '@/types'
import { formatDate, statusLabel, statusColor, downloadBlob } from '@/utils'

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [report, setReport]         = useState<Report | null>(null)
  const [loading, setLoading]       = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [downloading, setDownloading] = useState(false)

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const r = await reportService.getById(id)
      setReport(r)
    } catch {
      toast.error('Error al cargar el reporte')
      navigate('/reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  // Poll while processing
  useReportPolling({
    reportId: report?.status === 'processing' || report?.status === 'pending' ? (id ?? null) : null,
    onDone: (r) => { setReport(r); toast.success('Reporte completado') },
    onError: (r) => { setReport(r); toast.error(r.errorMessage ?? 'Error al procesar') },
  })

  const handleDownload = async () => {
    if (!id) return
    setDownloading(true)
    try {
      const blob = await reportService.download(id)
      downloadBlob(blob, `${report?.name ?? 'reporte'}.pdf`)
    } catch {
      toast.error('Error al descargar')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await reportService.delete(id)
      toast.success('Reporte eliminado')
      navigate('/reports')
    } catch {
      toast.error('Error al eliminar')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (loading) return <Spinner centered label="Cargando reporte…" />

  if (!report) return null

  const pdfFields   = report.extractedData?.filter((f) => f.source === 'pdf')   ?? []
  const excelFields = report.extractedData?.filter((f) => f.source === 'excel') ?? []

  return (
    <div className="page-container fade-in" style={{ maxWidth: 860 }}>
      <PageHeader
        title={report.name}
        subtitle={`Configurador: ${report.configuratorName}  ·  ${formatDate(report.createdAt)}`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Volver
            </button>
            {report.status === 'completed' && (
              <button className="btn btn-primary btn-sm" onClick={handleDownload} disabled={downloading}>
                {downloading
                  ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} />
                  : <><Download size={14} /> Descargar PDF</>}
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--color-red)' }}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </>
        }
      />

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <Badge variant={statusColor[report.status] as 'green' | 'amber' | 'red' | 'blue' | 'gray'}>
          {statusLabel[report.status]}
        </Badge>
        {(report.status === 'processing' || report.status === 'pending') && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-2)' }}>
            <RefreshCw size={13} style={{ animation: 'spin 1.5s linear infinite' }} />
            Procesando con IA…
          </span>
        )}
      </div>

      {report.status === 'error' && (
        <Alert variant="error" style={{ marginBottom: '1.25rem' }}>
          {report.errorMessage ?? 'Ocurrió un error al procesar el reporte.'}
        </Alert>
      )}

      {/* File info */}
      <div
        className="card"
        style={{ marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
      >
        <div>
          <p className="form-label" style={{ marginBottom: 6 }}>Archivo PDF</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>PDF</span>
            <span style={{ fontSize: '0.875rem' }}>{report.pdfFileName}</span>
          </div>
        </div>
        <div>
          <p className="form-label" style={{ marginBottom: 6 }}>Archivo Excel</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>XLS</span>
            <span style={{ fontSize: '0.875rem' }}>{report.excelFileName}</span>
          </div>
        </div>
      </div>

      {/* Extracted data */}
      {report.extractedData && report.extractedData.length > 0 && (
        <>
          <h2 style={{ marginBottom: '0.75rem' }}>Datos extraídos</h2>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}
          >
            {/* PDF data */}
            {pdfFields.length > 0 && (
              <div className="card">
                <p style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>PDF</span>
                  Campos extraídos
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pdfFields.map((f) => (
                    <div
                      key={f.fieldName}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '8px 0',
                        borderBottom: '0.5px solid var(--color-border)',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', minWidth: 110 }}>{f.fieldName}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{f.value || '—'}</span>
                        {f.confidence != null && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: f.confidence >= 80 ? 'var(--color-green)' : 'var(--color-amber)' }}>
                            {f.confidence}% confianza
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Excel data */}
            {excelFields.length > 0 && (
              <div className="card">
                <p style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>XLS</span>
                  Columnas incluidas
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {excelFields.map((f) => (
                    <div
                      key={f.fieldName}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '0.5px solid var(--color-border)',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)' }}>{f.fieldName}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{f.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar reporte"
        message={`¿Estás seguro de eliminar "${report.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default ReportDetailPage
