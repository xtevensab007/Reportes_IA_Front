// =============================================
// components/ui/FileDropzone.tsx
// =============================================

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, CheckCircle2, XCircle, File } from 'lucide-react'
import type { UploadedFile } from '@/types'
import { formatFileSize } from '@/utils'

interface Props {
  type: 'pdf' | 'excel'
  file: UploadedFile | null
  onFile: (f: UploadedFile) => void
  onRemove: () => void
  disabled?: boolean
}

const ACCEPT_MAP = {
  pdf:   { 'application/pdf': ['.pdf'] },
  excel: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
  },
}

const LABELS = {
  pdf:   { title: 'Archivo PDF',   hint: 'PDF hasta 50 MB',  color: 'var(--color-red-light)',   iconColor: 'var(--color-red)',   ext: 'PDF' },
  excel: { title: 'Archivo Excel', hint: 'XLSX / XLS hasta 20 MB', color: 'var(--color-green-light)', iconColor: 'var(--color-green)', ext: 'XLS' },
}

const FileDropzone: React.FC<Props> = ({ type, file, onFile, onRemove, disabled }) => {
  const meta = LABELS[type]

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted[0]) return
      onFile({ file: accepted[0], status: 'idle', progress: 0 })
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT_MAP[type],
    maxFiles: 1,
    disabled: disabled || !!file,
  })

  if (file) {
    return (
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-1)' }}>
          {meta.title}
        </p>
        <div
          style={{
            background: 'var(--color-surface)',
            border: `0.5px solid ${file.status === 'error' ? 'var(--color-red)' : 'var(--color-green)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: meta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: meta.iconColor,
              flexShrink: 0,
            }}
          >
            {meta.ext}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--color-text-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.file.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', marginTop: 2 }}>
              {formatFileSize(file.file.size)}
            </p>
            {file.status === 'uploading' && (
              <div className="progress-bar" style={{ marginTop: 6 }}>
                <div className="progress-fill" style={{ width: `${file.progress}%` }} />
              </div>
            )}
            {file.status === 'error' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-red)', marginTop: 2 }}>
                {file.errorMessage || 'Error al cargar'}
              </p>
            )}
          </div>
          {file.status === 'done' && <CheckCircle2 size={18} color="var(--color-green)" />}
          {file.status === 'uploading' && <div className="spinner" />}
          {!disabled && (
            <button
              onClick={onRemove}
              className="btn btn-ghost btn-icon"
              style={{ color: 'var(--color-text-3)' }}
              title="Quitar archivo"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-1)' }}>
        {meta.title}
      </p>
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' active' : ''}`}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      >
        <input {...getInputProps()} />
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          {isDragActive
            ? <UploadCloud size={20} color={meta.iconColor} />
            : <File size={20} color={meta.iconColor} />}
        </div>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 4 }}>
          {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-3)', marginBottom: 14 }}>
          {meta.hint}
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Seleccionar archivo
        </button>
      </div>
    </div>
  )
}

export default FileDropzone
