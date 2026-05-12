// =============================================
// components/reports/StepExport.tsx
// =============================================

import React, { useState } from 'react'
import { Download, CheckCircle2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useWizard } from '@/context/WizardContext'
import reportService from '@/services/reportService'
import { downloadBlob } from '@/utils'

const StepExport: React.FC = () => {
  const navigate = useNavigate()
  const { reportId, reportName, reset, setStep } = useWizard()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!reportId) return
    setDownloading(true)
    try {
      const blob = await reportService.download(reportId)
      downloadBlob(blob, `${reportName || 'reporte'}.pdf`)
      toast.success('Descarga iniciada')
    } catch {
      toast.error('Error al descargar el PDF')
    } finally {
      setDownloading(false)
    }
  }

/*const handleDownload = async () => {
  // MOCK temporal — quitar cuando el backend esté listo
  setDownloading(true)
  await new Promise((res) => setTimeout(res, 800))
  toast.success('En producción aquí se descargará el PDF real')
  setDownloading(false)
}*/
  const handleNewReport = () => {
    reset()
    navigate('/reports/new')
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Reporte listo</h2>
        <p style={{ color: 'var(--color-text-2)', marginTop: 4, fontSize: '0.875rem' }}>
          Tu reporte fue generado exitosamente. Descárgalo o crea uno nuevo.
        </p>
      </div>

      {/* Success card */}
      <div
        style={{
          background: 'var(--color-green-light)',
          border: '0.5px solid var(--color-green-mid)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <CheckCircle2 size={52} color="var(--color-green)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F4D08', marginBottom: 6 }}>
          ¡{reportName || 'Reporte'} generado!
        </p>
        <p style={{ fontSize: '0.875rem', color: '#2D6610', marginBottom: '1.5rem' }}>
          El PDF ha sido creado con los datos del PDF y el Excel combinados.
        </p>
        <button
          className="btn btn-primary btn-lg"
          style={{ justifyContent: 'center' }}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading
            ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }} /> Descargando…</>
            : <><Download size={18} /> Descargar PDF</>}
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => setStep('review')}>
          ← Volver a revisión
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
            Ver mis reportes
          </button>
          <button className="btn btn-primary" onClick={handleNewReport}>
            <Plus size={16} /> Nuevo reporte
          </button>
        </div>
      </div>
    </div>
  )
}

export default StepExport
