// =============================================
// pages/ConfiguratorsPage.tsx — COMPLETO
// =============================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, FilePlus2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useConfigurators } from '@/hooks/useConfigurators'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Spinner from '@/components/ui/Spinner'
import type { Configurator } from '@/types'
import { formatDate } from '@/utils'
import { usePageTitle } from '@/hooks/useUtils'

const ConfiguratorsPage: React.FC = () => {
  usePageTitle('Configuradores')
  const navigate = useNavigate()
  const { configurators, loading, remove } = useConfigurators()

  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Configurator | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await remove(deleteTarget.id)
      toast.success('Configurador eliminado')
      setDeleteTarget(null)
      if (expandedId === deleteTarget.id) setExpandedId(null)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner centered label="Cargando configuradores…" />

  return (
    <div className="page-container fade-in">
      <PageHeader
        title="Configuradores"
        subtitle="Plantillas de extracción reutilizables para distintos tipos de documentos."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/configurators/new')}>
            <Plus size={16} /> Nuevo configurador
          </button>
        }
      />

      {configurators.length === 0 ? (
        <EmptyState
          title="No hay configuradores guardados"
          description="Crea tu primer configurador para definir qué campos extraer del PDF y qué columnas tomar del Excel."
          icon={<FilePlus2 size={40} style={{ margin: '0 auto' }} />}
          action={
            <button className="btn btn-primary" onClick={() => navigate('/configurators/new')}>
              <Plus size={16} /> Crear configurador
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {configurators.map((cfg) => {
            const isExpanded = expandedId === cfg.id
            const includedCols = cfg.excelColumns.filter((c) => c.included)

            return (
              <div
                key={cfg.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                {/* ── Row header ── */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : cfg.id)}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 36, height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-blue-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FilePlus2 size={16} color="var(--color-blue)" />
                  </div>

                  {/* Name + desc */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, marginBottom: 2 }}>{cfg.name}</p>
                    {cfg.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cfg.description}
                      </p>
                    )}
                  </div>

                  {/* Meta pills */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: 20 }}>
                      {cfg.pdfFields.length} campo{cfg.pdfFields.length !== 1 ? 's' : ''} PDF
                    </span>
                    <span style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: 20 }}>
                      {includedCols.length} col. Excel
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center' }}>
                      {formatDate(cfg.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-ghost btn-icon"
                      title="Editar configurador"
                      onClick={() => navigate(`/configurators/${cfg.id}/edit`)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ color: 'var(--color-red)' }}
                      title="Eliminar configurador"
                      onClick={() => setDeleteTarget(cfg)}
                    >
                      <Trash2 size={14} />
                    </button>
                    {isExpanded
                      ? <ChevronUp size={16} color="var(--color-text-3)" />
                      : <ChevronDown size={16} color="var(--color-text-3)" />}
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '0.5px solid var(--color-border)',
                      background: 'var(--color-bg)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      {/* PDF Fields */}
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>PDF</span>
                          Campos de extracción
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {cfg.pdfFields.map((f) => (
                            <div
                              key={f.id}
                              style={{
                                background: 'var(--color-blue-light)',
                                border: '0.5px solid var(--color-blue-mid)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '8px 10px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-blue-dark)' }}>{f.name}</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-blue)', background: 'rgba(24,95,165,0.12)', padding: '1px 6px', borderRadius: 3 }}>{f.type}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-blue)' }}>{f.minConfidence}%</span>
                                </div>
                              </div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--color-blue)', lineHeight: 1.4 }}>{f.instruction}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Excel Columns */}
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>XLS</span>
                          Columnas incluidas
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {cfg.excelColumns.map((c) => (
                            <div
                              key={c.id}
                              style={{
                                background: c.included ? 'var(--color-green-light)' : 'var(--color-surface-2)',
                                border: `0.5px solid ${c.included ? 'var(--color-green-mid)' : 'var(--color-border)'}`,
                                borderRadius: 'var(--radius-sm)',
                                padding: '8px 10px',
                                opacity: c.included ? 1 : 0.5,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: c.included ? 'var(--color-green)' : 'var(--color-text-3)' }}>
                                  {c.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: c.included ? 'var(--color-green)' : 'var(--color-text-3)' }}>
                                  Col {c.columnLetter} · {c.sheetName} · fila {c.startRow}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Output options row */}
                    <div
                      style={{
                        background: 'var(--color-surface)',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        display: 'flex',
                        gap: 20,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)' }}>
                        <strong>Formato:</strong> {cfg.outputFormat.replace('_', ' ')}
                      </span>
                      {[
                        { key: 'includePortada',       label: 'Portada',        val: cfg.includePortada },
                        { key: 'includeDataTable',     label: 'Tabla datos',    val: cfg.includeDataTable },
                        { key: 'includeOriginalPages', label: 'PDF original',   val: cfg.includeOriginalPages },
                        { key: 'includeAiSummary',     label: 'Resumen IA',     val: cfg.includeAiSummary },
                      ].map(({ key, label, val }) => (
                        <span
                          key={key}
                          style={{
                            fontSize: '0.8125rem',
                            color: val ? 'var(--color-green)' : 'var(--color-text-3)',
                          }}
                        >
                          {val ? '✓' : '✗'} {label}
                        </span>
                      ))}
                    </div>

                    {/* Edit button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/configurators/${cfg.id}/edit`)}
                      >
                        <Edit2 size={13} /> Editar configurador
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar configurador"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Los reportes que lo usen no se verán afectados, pero no podrás reutilizarlo.`}
        confirmLabel="Eliminar"
        loading={deleting}
        variant="danger"
      />
    </div>
  )
}

export default ConfiguratorsPage
