// =============================================
// components/reports/StepFiles.tsx
// =============================================

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import FileDropzone from '@/components/ui/FileDropzone'
import { useWizard } from '@/context/WizardContext'
import reportService from '@/services/reportService'
import type { UploadedFile } from '@/types'

const StepFiles: React.FC = () => {
  const { uploadedPdf, uploadedExcel, setPdf, setExcel, setStep } = useWizard()
  const [uploading, setUploading] = useState(false)

  const handlePdf = (f: UploadedFile) => setPdf(f)
  const handleExcel = (f: UploadedFile) => setExcel(f)

  const handleContinue = async () => {
    if (!uploadedPdf || !uploadedExcel) {
      toast.error('Debes subir ambos archivos (PDF y Excel)')
      return
    }
    setUploading(true)
    try {
      // Upload PDF
      setPdf({ ...uploadedPdf, status: 'uploading', progress: 0 })
      const pdfResult = await reportService.uploadFile(
        uploadedPdf.file,
        'pdf',
        (pct) => setPdf({ ...uploadedPdf, status: 'uploading', progress: pct })
      )
      setPdf({ ...uploadedPdf, status: 'done', progress: 100, uploadId: pdfResult.uploadId })

      // Upload Excel
      setExcel({ ...uploadedExcel, status: 'uploading', progress: 0 })
      const excelResult = await reportService.uploadFile(
        uploadedExcel.file,
        'excel',
        (pct) => setExcel({ ...uploadedExcel, status: 'uploading', progress: pct })
      )
      setExcel({ ...uploadedExcel, status: 'done', progress: 100, uploadId: excelResult.uploadId })

      toast.success('Archivos subidos correctamente')
      setStep('configurator')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Error al subir archivos')
      if (uploadedPdf.status !== 'done') setPdf({ ...uploadedPdf, status: 'error', progress: 0 })
      if (uploadedExcel.status !== 'done') setExcel({ ...uploadedExcel, status: 'error', progress: 0 })
    } finally {
      setUploading(false)
    }
  }

/*const handleContinue = async () => {
  if (!uploadedPdf || !uploadedExcel) {
    toast.error('Debes subir ambos archivos (PDF y Excel)')
    return
  }

  // MOCK temporal — quitar cuando el backend esté listo
  setPdf({ ...uploadedPdf, status: 'done', progress: 100, uploadId: 'mock-pdf-id' })
  setExcel({ ...uploadedExcel, status: 'done', progress: 100, uploadId: 'mock-excel-id' })
  toast.success('Archivos cargados correctamente')
  setStep('configurator')
}*/
  const canContinue = !!uploadedPdf && !!uploadedExcel

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Carga de archivos</h2>
        <p style={{ color: 'var(--color-text-2)', marginTop: 4, fontSize: '0.875rem' }}>
          Sube el PDF del que se extraerá la información y el Excel con los datos adicionales.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <FileDropzone
          type="pdf"
          file={uploadedPdf}
          onFile={handlePdf}
          onRemove={() => setPdf(null)}
          disabled={uploading}
        />
        <FileDropzone
          type="excel"
          file={uploadedExcel}
          onFile={handleExcel}
          onRemove={() => setExcel(null)}
          disabled={uploading}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={!canContinue || uploading}
        >
          {uploading
            ? <><div className="spinner" style={{ borderTopColor: '#fff', width: 14, height: 14 }} /> Subiendo…</>
            : 'Continuar →'}
        </button>
      </div>
    </div>
  )
}

export default StepFiles
