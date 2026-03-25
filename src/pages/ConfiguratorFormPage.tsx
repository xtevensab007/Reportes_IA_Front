// =============================================
// pages/ConfiguratorFormPage.tsx
// Crear o editar un configurador de forma independiente
// =============================================

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import configuratorService from '@/services/configuratorService'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import type { PdfField, ExcelColumn, FieldType, Configurator } from '@/types'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text',    label: 'Texto' },
  { value: 'number',  label: 'Número' },
  { value: 'date',    label: 'Fecha' },
  { value: 'boolean', label: 'Booleano' },
]

const OUTPUT_FORMATS: { value: Configurator['outputFormat']; label: string }[] = [
  { value: 'A4_vertical',    label: 'PDF A4 Vertical' },
  { value: 'A4_horizontal',  label: 'PDF A4 Horizontal' },
  { value: 'pdfa',           label: 'PDF/A (archivable)' },
]

const emptyPdfField = (): PdfField => ({
  id: crypto.randomUUID(), name: '', type: 'text',
  instruction: '', minConfidence: 80, required: true,
})

const emptyExcelCol = (): ExcelColumn => ({
  id: crypto.randomUUID(), name: '', columnLetter: '',
  sheetName: 'Hoja1', startRow: 2, included: true,
})

const ConfiguratorFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading]   = useState(isEdit)
  const [saving, setSaving]     = useState(false)

  // Form state
  const [name, setName]             = useState('')
  const [description, setDescription] = useState('')
  const [pdfFields, setPdfFields]   = useState<PdfField[]>([emptyPdfField()])
  const [excelCols, setExcelCols]   = useState<ExcelColumn[]>([emptyExcelCol()])
  const [outputFormat, setOutputFormat] = useState<Configurator['outputFormat']>('A4_vertical')
  const [includePortada, setIncludePortada]         = useState(true)
  const [includeDataTable, setIncludeDataTable]     = useState(true)
  const [includeOriginalPages, setIncludeOriginalPages] = useState(true)
  const [includeAiSummary, setIncludeAiSummary]     = useState(false)

  useEffect(() => {
    if (!isEdit) return
    configuratorService.getById(id!)
      .then((cfg) => {
        setName(cfg.name)
        setDescription(cfg.description ?? '')
        setPdfFields(cfg.pdfFields.length ? cfg.pdfFields : [emptyPdfField()])
        setExcelCols(cfg.excelColumns.length ? cfg.excelColumns : [emptyExcelCol()])
        setOutputFormat(cfg.outputFormat)
        setIncludePortada(cfg.includePortada)
        setIncludeDataTable(cfg.includeDataTable)
        setIncludeOriginalPages(cfg.includeOriginalPages)
        setIncludeAiSummary(cfg.includeAiSummary)
      })
      .catch(() => { toast.error('Error al cargar configurador'); navigate('/configurators') })
      .finally(() => setLoading(false))
  }, [id])

  // PDF helpers
  const updatePdf = (fieldId: string, patch: Partial<PdfField>) =>
    setPdfFields((p) => p.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)))
  const removePdf = (fieldId: string) => setPdfFields((p) => p.filter((f) => f.id !== fieldId))

  // Excel helpers
  const updateXls = (colId: string, patch: Partial<ExcelColumn>) =>
    setExcelCols((p) => p.map((c) => (c.id === colId ? { ...c, ...patch } : c)))
  const removeXls = (colId: string) => setExcelCols((p) => p.filter((c) => c.id !== colId))

  const handleSave = async () => {
    if (!name.trim()) { toast.error('El nombre es obligatorio'); return }
    if (pdfFields.some((f) => !f.name || !f.instruction)) {
      toast.error('Completa todos los campos PDF (nombre e instrucción)'); return
    }
    if (excelCols.some((c) => c.included && (!c.name || !c.columnLetter))) {
      toast.error('Completa las columnas de Excel incluidas'); return
    }
    setSaving(true)
    try {
      const payload = {
        name, description, pdfFields, excelColumns: excelCols,
        outputFormat, includePortada, includeDataTable,
        includeOriginalPages, includeAiSummary,
      }
      if (isEdit) {
        await configuratorService.update(id!, payload)
        toast.success('Configurador actualizado')
      } else {
        await configuratorService.create(payload)
        toast.success('Configurador creado')
      }
      navigate('/configurators')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner centered label="Cargando…" />

  return (
    <div className="page-container fade-in" style={{ maxWidth: 860 }}>
      <PageHeader
        title={isEdit ? 'Editar configurador' : 'Nuevo configurador'}
        subtitle="Define los campos de extracción y las columnas de Excel"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Volver
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving
                ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} />
                : <><Save size={14} /> {isEdit ? 'Actualizar' : 'Crear configurador'}</>}
            </button>
          </>
        }
      />

      {/* Basic info */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Información general</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nombre *</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Financiero mensual" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Descripción (opcional)</label>
            <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Para qué tipo de documentos aplica…" />
          </div>
          <div className="form-group">
            <label className="form-label">Formato de salida</label>
            <select className="form-select" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as Configurator['outputFormat'])}>
              {OUTPUT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Secciones del reporte</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {[
                { key: 'portada',        label: 'Portada con metadatos',      val: includePortada,        set: setIncludePortada },
                { key: 'dataTable',      label: 'Tabla de datos consolidada', val: includeDataTable,      set: setIncludeDataTable },
                { key: 'originalPages',  label: 'Páginas del PDF original',   val: includeOriginalPages,  set: setIncludeOriginalPages },
                { key: 'aiSummary',      label: 'Resumen ejecutivo IA',       val: includeAiSummary,      set: setIncludeAiSummary },
              ].map(({ key, label, val, set }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: PDF fields + Excel columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* PDF Fields */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>PDF</span>
              <span style={{ fontWeight: 600 }}>Campos a extraer</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPdfFields((p) => [...p, emptyPdfField()])}>
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pdfFields.map((field, idx) => (
              <div
                key={field.id}
                style={{
                  background: 'var(--color-blue-light)',
                  border: '0.5px solid var(--color-blue-mid)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-blue-dark)', fontWeight: 500 }}>
                    Campo #{idx + 1}
                  </span>
                  {pdfFields.length > 1 && (
                    <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-red)', padding: 2 }} onClick={() => removePdf(field.id)}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Nombre del campo"
                    value={field.name}
                    onChange={(e) => updatePdf(field.id, { name: e.target.value })}
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '6px 10px' }}
                  />
                  <select
                    className="form-select"
                    value={field.type}
                    onChange={(e) => updatePdf(field.id, { type: e.target.value as FieldType })}
                    style={{ width: 96, fontSize: '0.8125rem', padding: '6px 8px' }}
                  >
                    {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <textarea
                  className="form-textarea"
                  placeholder='Instrucción IA: "Extrae el nombre completo del proveedor"'
                  value={field.instruction}
                  onChange={(e) => updatePdf(field.id, { instruction: e.target.value })}
                  rows={2}
                  style={{ fontSize: '0.8125rem', resize: 'none', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-blue-dark)' }}>Confianza mín:</span>
                  <input
                    type="number" min={0} max={100}
                    value={field.minConfidence}
                    onChange={(e) => updatePdf(field.id, { minConfidence: Number(e.target.value) })}
                    style={{ width: 54, fontSize: '0.8125rem', padding: '3px 8px', border: '0.5px solid var(--color-blue-mid)', borderRadius: 'var(--radius-sm)', background: 'white' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-blue-dark)' }}>%</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-blue-dark)', marginLeft: 'auto', cursor: 'pointer' }}>
                    <input type="checkbox" checked={field.required} onChange={(e) => updatePdf(field.id, { required: e.target.checked })} />
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
              <span style={{ fontWeight: 600 }}>Columnas a incluir</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setExcelCols((p) => [...p, emptyExcelCol()])}>
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {excelCols.map((col, idx) => (
              <div
                key={col.id}
                style={{
                  background: col.included ? 'var(--color-green-light)' : 'var(--color-surface-2)',
                  border: `0.5px solid ${col.included ? 'var(--color-green-mid)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  opacity: col.included ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-green)', fontWeight: 500 }}>
                    Columna #{idx + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-green)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={col.included} onChange={(e) => updateXls(col.id, { included: e.target.checked })} />
                      Incluir
                    </label>
                    {excelCols.length > 1 && (
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-red)', padding: 2 }} onClick={() => removeXls(col.id)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Nombre del campo"
                    value={col.name}
                    onChange={(e) => updateXls(col.id, { name: e.target.value })}
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '6px 10px' }}
                  />
                  <input
                    className="form-input"
                    placeholder="Col"
                    value={col.columnLetter}
                    onChange={(e) => updateXls(col.id, { columnLetter: e.target.value.toUpperCase() })}
                    style={{ width: 60, fontSize: '0.8125rem', padding: '6px 8px', textAlign: 'center' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    placeholder="Nombre hoja"
                    value={col.sheetName}
                    onChange={(e) => updateXls(col.id, { sheetName: e.target.value })}
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '6px 10px' }}
                  />
                  <input
                    type="number" min={1}
                    value={col.startRow}
                    onChange={(e) => updateXls(col.id, { startRow: Number(e.target.value) })}
                    placeholder="Fila"
                    style={{ width: 64, fontSize: '0.8125rem', padding: '6px 8px', border: '0.5px solid var(--color-border-md)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving
            ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} />
            : <><Save size={14} /> {isEdit ? 'Actualizar configurador' : 'Crear configurador'}</>}
        </button>
      </div>
    </div>
  )
}

export default ConfiguratorFormPage
