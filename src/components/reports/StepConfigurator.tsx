// =============================================
// components/reports/StepConfigurator.tsx
// =============================================

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useWizard } from '@/context/WizardContext'
import configuratorService from '@/services/configuratorService'
import reportService from '@/services/reportService'
import type { Configurator, PdfField, ExcelColumn, FieldType } from '@/types'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT',     label: 'Texto' },
  { value: 'NUMBER',   label: 'Número' },
  { value: 'DATE',     label: 'Fecha' },
  { value: 'CURRENCY', label: 'Moneda' },
]

const emptyPdfField = (): PdfField => ({
  id: crypto.randomUUID(),
  name: '',
  type: 'TEXT',
  instruction: '',
  minConfidence: 80,
  required: true,
})

const emptyExcelCol = (): ExcelColumn => ({
  id: crypto.randomUUID(),
  label: '',
  column: '',
  sheet: 'Hoja1',
  startRow: 1,
  active: true,
})

const StepConfigurator: React.FC = () => {
  const {
    uploadedPdf, uploadedExcel,
    selectedConfiguratorId, setConfigurator,
    setStep, setReportId, reportName, setReportName,
  } = useWizard()

  const [templates, setTemplates] = useState<Configurator[]>([])
  const [pdfFields, setPdfFields] = useState<PdfField[]>([emptyPdfField()])
  const [excelCols, setExcelCols] = useState<ExcelColumn[]>([emptyExcelCol()])
  const [configName, setConfigName] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  useEffect(() => {
    configuratorService.list()
      .then(setTemplates)
      .catch(() => toast.error('Error al cargar plantillas'))
      .finally(() => setLoadingTemplates(false))
  }, [])

  const loadTemplate = async (id: string) => {
    if (!id) { setConfigurator(null); return }
    try {
      const cfg = await configuratorService.getById(id)
      setConfigurator(id)
      setPdfFields(cfg.pdfFields.length ? cfg.pdfFields : [emptyPdfField()])
      setExcelCols(cfg.excelColumns.length ? cfg.excelColumns : [emptyExcelCol()])
      setConfigName(cfg.name)
    } catch {
      toast.error('Error al cargar la plantilla')
    }
  }

  // PDF fields helpers
  const updatePdfField = (id: string, patch: Partial<PdfField>) =>
    setPdfFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const removePdfField = (id: string) =>
    setPdfFields((prev) => prev.filter((f) => f.id !== id))

  // Excel cols helpers
  const updateExcelCol = (id: string, patch: Partial<ExcelColumn>) =>
    setExcelCols((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const removeExcelCol = (id: string) =>
    setExcelCols((prev) => prev.filter((c) => c.id !== id))

  const handleSaveTemplate = async () => {
    if (!configName.trim()) { toast.error('Ingresa un nombre para la plantilla'); return }
    setSavingTemplate(true)
    try {
      const saved = await configuratorService.create({
        name: configName,
        pdfFields,
        excelColumns: excelCols,
        includePortada: true,
        includeDataTable: true,
        includeOriginalPages: true,
        includeAiSummary: false,
        outputFormat: 'A4_vertical',
      })
      setTemplates((prev) => [...prev, saved])
      setConfigurator(saved.id)
      toast.success('Plantilla guardada')
    } catch {
      toast.error('Error al guardar plantilla')
    } finally {
      setSavingTemplate(false)
    }
  }

 const handleProcess = async () => {
    if (!uploadedPdf?.uploadId || !uploadedExcel?.uploadId) {
      toast.error('Archivos no disponibles'); return
    }
    if (pdfFields.length === 0) {
    toast.error('Debes definir al menos un campo a extraer'); return
    }
    if (pdfFields.some((f) => !f.name.trim() || !f.instruction.trim())) {
    toast.error('Completa el nombre e instrucción de todos los campos PDF'); return
    }
    if (excelCols.some((c) => c.active && (!c.label || !c.column))) {
      toast.error('Completa las columnas de Excel incluidas'); return
    }
    if (!reportName.trim()) { toast.error('Ingresa un nombre para el reporte'); return }

    setProcessing(true)
    try {
      // Save config if no template selected
      let cfgId = selectedConfiguratorId
      if (!cfgId) {
  // 1. Crear configurador con solo el nombre
  const saved = await configuratorService.create({
    name: configName || `Config ${new Date().toLocaleDateString()}`,
    pdfFields,
    excelColumns: excelCols,
    includePortada: true,
    includeDataTable: true,
    includeOriginalPages: true,
    includeAiSummary: false,
    outputFormat: 'A4_vertical',
  })
  cfgId = saved.id

  // 2. Actualizar con los campos PDF y columnas Excel
  await configuratorService.update(cfgId, {
    name: configName || `Config ${new Date().toLocaleDateString()}`,
    pdfFields,
    excelColumns: excelCols,
  })

  setConfigurator(cfgId)
}

      const report = await reportService.create({
        name: reportName,
        configuratorId: cfgId,
        pdfUploadId: uploadedPdf.uploadId,
        excelUploadId: uploadedExcel.uploadId,
      })
      setReportId(report.id)

      // Poll until extraction is ready (max 30s)
      let attempts = 0
      const poll = async () => {
        if (attempts++ > 15) throw new Error('Timeout esperando extracción')
        const r = await reportService.getById(report.id)
        if (r.status === 'error') throw new Error(r.errorMessage || 'Error en extracción')
        if (r.status === 'processing' || r.status === 'pending') {
          await new Promise((res) => setTimeout(res, 2000))
          return poll()
        }
        return r
      }
      await poll()
      toast.success('¡Extracción completada!')
      setStep('review')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Error al procesar')
    } finally {
      setProcessing(false)
    }
  }

/*const handleProcess = async () => {
  if (!reportName.trim()) { toast.error('Ingresa un nombre para el reporte'); return }

  // MOCK temporal — quitar cuando el backend esté listo
  setProcessing(true)
  await new Promise((res) => setTimeout(res, 1000))
  setReportId('mock-report-id')
  toast.success('¡Extracción completada!')
  setStep('review')
  setProcessing(false)
}*/
  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Configurador de extracción</h2>
        <p style={{ color: 'var(--color-text-2)', marginTop: 4, fontSize: '0.875rem' }}>
          Define qué información extraer del PDF y qué columnas usar del Excel.
        </p>
      </div>

      {/* Report name */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Nombre del reporte *</label>
          <input
            className="form-input"
            placeholder="Ej: Reporte financiero Q1 2025"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>
      </div>

      {/* Template selector */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Usar plantilla guardada</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-2)', marginTop: 2 }}>
              Carga una configuración anterior para reutilizarla
            </p>
          </div>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <select
              className="form-select"
              value={selectedConfiguratorId ?? ''}
              onChange={(e) => loadTemplate(e.target.value)}
              disabled={loadingTemplates}
            >
              <option value="">— Nueva configuración —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-3)' }} />
          </div>
        </div>
      </div>

      {/* Two-column panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* PDF Fields */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>PDF</span>
              <span style={{ fontWeight: 500 }}>Campos a extraer</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPdfFields((p) => [...p, emptyPdfField()])}>
              <Plus size={12} /> Agregar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pdfFields.map((field) => (
              <div
                key={field.id}
                style={{
                  background: 'var(--color-blue-light)',
                  border: '0.5px solid var(--color-blue-mid)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Nombre del campo"
                    value={field.name}
                    onChange={(e) => updatePdfField(field.id, { name: e.target.value })}
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '6px 10px' }}
                  />
                  <select
                    className="form-select"
                    value={field.type}
                    onChange={(e) => updatePdfField(field.id, { type: e.target.value as FieldType })}
                    style={{ width: 100, fontSize: '0.8125rem', padding: '6px 10px' }}
                  >
                    {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  {pdfFields.length > 1 && (
                    <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-red)' }} onClick={() => removePdfField(field.id)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <textarea
                  className="form-textarea"
                  placeholder='Instrucción para la IA: "Extrae el nombre del proveedor del encabezado"'
                  value={field.instruction}
                  onChange={(e) => updatePdfField(field.id, { instruction: e.target.value })}
                  rows={2}
                  style={{ fontSize: '0.8125rem', resize: 'none' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-blue-dark)' }}>Confianza mín:</span>
                  <input
                    type="number"
                    min={0} max={100}
                    value={field.minConfidence}
                    onChange={(e) => updatePdfField(field.id, { minConfidence: Number(e.target.value) })}
                    style={{ width: 58, fontSize: '0.8125rem', padding: '4px 8px', border: '0.5px solid var(--color-blue-mid)', borderRadius: 'var(--radius-sm)', background: 'white' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-blue-dark)' }}>%</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-blue-dark)', marginLeft: 'auto', cursor: 'pointer' }}>
                    <input type="checkbox" checked={field.required} onChange={(e) => updatePdfField(field.id, { required: e.target.checked })} />
                    Requerido
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Excel Columns */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>XLS</span>
              <span style={{ fontWeight: 500 }}>Columnas a incluir</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setExcelCols((p) => [...p, emptyExcelCol()])}>
              <Plus size={12} /> Agregar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {excelCols.map((col) => (
              <div
                key={col.id}
                style={{
                  background: col.active ? 'var(--color-green-light)' : 'var(--color-surface-2)',
                  border: `0.5px solid ${col.active ? 'var(--color-green-mid)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  opacity: col.active ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
  className="form-input"
  placeholder="Nombre del campo"
  value={col.label}
  onChange={(e) => updateExcelCol(col.id, { label: e.target.value })}
  style={{ flex: 1, fontSize: '0.8125rem', padding: '6px 10px' }}
/>
<input
  className="form-input"
  placeholder="Col (A, B…)"
  value={col.column}
  onChange={(e) => updateExcelCol(col.id, { column: e.target.value.toUpperCase() })}
  style={{ width: 72, fontSize: '0.8125rem', padding: '6px 10px', textAlign: 'center' }}
/>
{excelCols.length > 1 && (
  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-red)' }} onClick={() => removeExcelCol(col.id)}>
    <Trash2 size={13} />
  </button>
)}
</div>
<div style={{ display: 'flex', gap: 8 }}>
  <input
    className="form-input"
    placeholder="Nombre hoja"
    value={col.sheet}
    onChange={(e) => updateExcelCol(col.id, { sheet: e.target.value })}
    style={{ flex: 1, fontSize: '0.8125rem', padding: '6px 10px' }}
  />
  <input
    type="number"
    min={1}
    value={col.startRow}
    onChange={(e) => updateExcelCol(col.id, { startRow: Number(e.target.value) })}
    placeholder="Fila inicio"
    style={{ width: 80, fontSize: '0.8125rem', padding: '6px 10px', border: '0.5px solid var(--color-border-md)', borderRadius: 'var(--radius-sm)' }}
  />
  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-green)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
    <input type="checkbox" checked={col.active} onChange={(e) => updateExcelCol(col.id, { active: e.target.checked })} />
    Incluir
  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save template + actions */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontWeight: 500, marginBottom: 10 }}>Guardar como plantilla</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            placeholder="Nombre de la plantilla"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-secondary"
            onClick={handleSaveTemplate}
            disabled={savingTemplate}
          >
            {savingTemplate ? <div className="spinner" style={{ width: 14, height: 14 }} /> : 'Guardar plantilla'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={() => setStep('files')}>← Atrás</button>
        <button
          className="btn btn-primary"
          onClick={handleProcess}
          disabled={processing}
        >
          {processing
            ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Procesando con IA…</>
            : 'Procesar con IA →'}
        </button>
      </div>
    </div>
  )
}

export default StepConfigurator
