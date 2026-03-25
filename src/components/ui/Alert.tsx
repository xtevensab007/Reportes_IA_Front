// =============================================
// components/ui/Alert.tsx
// =============================================

import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

type Variant = 'success' | 'warning' | 'error' | 'info'

interface Props {
  variant: Variant
  children: React.ReactNode
  onClose?: () => void
  className?: string
  style?: React.CSSProperties
}

const ICONS: Record<Variant, React.ReactNode> = {
  success: <CheckCircle2 size={16} />,
  warning: <AlertTriangle size={16} />,
  error:   <XCircle size={16} />,
  info:    <Info size={16} />,
}

const Alert: React.FC<Props> = ({ variant, children, onClose, className, style }) => (
  <div className={`alert alert-${variant}${className ? ` ${className}` : ''}`} style={style}>
    {ICONS[variant]}
    <span style={{ flex: 1 }}>{children}</span>
    {onClose && (
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          opacity: 0.6,
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    )}
  </div>
)

export default Alert
