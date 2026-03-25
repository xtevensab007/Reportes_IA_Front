// =============================================
// components/reports/StepReview.tsx
// =============================================

import React, { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useWizard } from '@/context/WizardContext'
import reportService from '@/services/reportService'
import Badge from '@/components/ui/Badge'
import type { ExtractedField } from '@/types'

const StepReview: React.FC = () => {
  const { reportId, extractedData, setExtractedData, updateField, setStep } = useWizard()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  /*useEffect(() => {
    if (!reportId || extractedData.length > 0) return
    setLoading(true)
    reportService.getById(reportId)
      .then((r) => setExtractedData(r.extractedData ?? []))
      .catch(() => toast.error('Error al cargar datos extraídos'))
      .finally(() => setLoading(false))
  }, [reportId])
*/
useEffect(() => {
  if (extractedData.length > 0) return

  // MOCK temporal — quitar cuando el backend esté listo
  setExtractedData([
    { fieldName: 'Nombre proveedor', source: 'pdf',   value: 'Suministros Andinos S.A.S', confidence: 95, needsReview: false },
    { fieldName: 'Monto total',      source: 'pdf',   value: '$ 4.850.000',               confidence: 72, needsReview: true  },
    { fieldName: 'Fecha emisión',    source: 'pdf',   value: '15/03/2025',                confidence: 98, needsReview: false },
    { fieldName: 'NIT',              source: 'excel', value: '900.123.456-7',             confidence: undefined, needsReview: false },
    { fieldName: 'Presupuesto',      source: 'excel', value: '$ 5.200.000',               confidence: undefined, needsReview: false },
  ])
}, [reportId])

  const handleFieldChange = async (fieldName: string, value: string) => {
    updateField(fieldName, value)
    if (!reportId) return
    try {
      await reportService.updateField(reportId, { fieldName, value })
    } catch {
      toast.error('Error al actualizar campo')
    }
  }



 /* const handleGenerate = async () => {
    if (!reportId) return
    const pending = extractedData.filter((f) => f.needsReview)
    if (pending.length > 0) {
      if (!confirm(`Hay ${pending.length} campo(s) marcados para revisión. ¿Continuar de todas formas?`)) return
    }
    setGenerating(true)
    try {
      await reportService.generatePdf(reportId)
      toast.success('¡PDF generado correctamente!')
      setStep('export')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Error al generar el PDF')
    } finally {
      setGenerating(false)
    }
  }
*/
const handleGenerate = async () => {
  // MOCK temporal — quitar cuando el backend esté listo
  setGenerating(true)
  await new Promise((res) => setTimeout(res, 1200))
  toast.success('¡PDF generado correctamente!')
  setStep('export')
  setGenerating(false)
}
  const needsReviewCount = extractedData.filter((f) => f.needsReview).length
  const pdfFields = extractedData.filter((f) => f.source === 'pdf')
  const excelFields = extractedData.filter((f) => f.source === 'excel')

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-3)' }}>
        <div className="spinner" style={{ margin: '0 auto 12px', width: 28, height: 28 }} />
        Cargando datos extraídos…
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Revisión de datos extraídos</h2>
        <p style={{ color: 'var(--color-text-2)', marginTop: 4, fontSize: '0.875rem' }}>
          Verifica y corrige los datos antes de generar el reporte final.
        </p>
      </div>

      {/* Status banner */}
      {needsReviewCount === 0 ? (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={16} />
          <span>Todos los campos fueron extraídos correctamente. Puedes proceder a generar el PDF.</span>
        </div>
      ) : (
        <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={16} />
          <span>{needsReviewCount} campo(s) requieren revisión manual antes de continuar.</span>
        </div>
      )}

      {/* Consolidated table */}
      <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '0.5px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 500 }}>Datos consolidados</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)' }}>
            Haz clic en cualquier valor para editarlo
          </span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Fuente</th>
              <th>Valor extraído</th>
              <th>Confianza</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {[...pdfFields, ...excelFields].map((field: ExtractedField) => (
              <tr key={field.fieldName}>
                <td style={{ fontWeight: 500 }}>{field.fieldName}</td>
                <td>
                  <Badge variant={field.source === 'pdf' ? 'red' : 'green'}>
                    {field.source.toUpperCase()}
                  </Badge>
                </td>
                <td>
                  <input
                    className="form-input"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                    style={{
                      fontSize: '0.875rem',
                      padding: '5px 10px',
                      background: field.needsReview ? 'var(--color-amber-light)' : 'transparent',
                      border: field.needsReview
                        ? '0.5px solid #FAC775'
                        : '0.5px solid transparent',
                      width: '100%',
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '0.5px solid var(--color-blue)'
                      e.target.style.background = 'var(--color-surface)'
                    }}
                    onBlur={(e) => {
                      e.target.style.border = field.needsReview ? '0.5px solid #FAC775' : '0.5px solid transparent'
                      e.target.style.background = field.needsReview ? 'var(--color-amber-light)' : 'transparent'
                    }}
                  />
                </td>
                <td style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>
                  {field.confidence != null ? `${field.confidence}%` : '—'}
                </td>
                <td>
                  <Badge variant={field.needsReview ? 'amber' : 'green'}>
                    {field.needsReview ? 'Revisar' : 'OK'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={() => setStep('configurator')}>← Atrás</button>
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating
            ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Generando PDF…</>
            : 'Generar PDF →'}
        </button>
      </div>
    </div>
  )
}

export default StepReview
