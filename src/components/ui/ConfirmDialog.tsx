// =============================================
// components/ui/ConfirmDialog.tsx
// =============================================

import React from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  variant?: 'danger' | 'warning'
  /** Optional extra content rendered below the message (e.g. a password field) */
  children?: React.ReactNode
}

const ConfirmDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  variant = 'danger',
  children,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} width={420}>
    <div style={{ display: 'flex', gap: 14, marginBottom: children ? '1rem' : '1.5rem' }}>
      <div
        style={{
          flexShrink: 0,
          width: 38, height: 38,
          borderRadius: 'var(--radius-md)',
          background: variant === 'danger' ? 'var(--color-red-light)' : 'var(--color-amber-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <AlertTriangle
          size={18}
          color={variant === 'danger' ? 'var(--color-red)' : 'var(--color-amber)'}
        />
      </div>
      <p style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}>{message}</p>
    </div>

    {children && <div style={{ marginBottom: '1.5rem' }}>{children}</div>}

    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </button>
      <button
        className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading
          ? <div className="spinner" style={{ width: 14, height: 14 }} />
          : confirmLabel}
      </button>
    </div>
  </Modal>
)

export default ConfirmDialog
