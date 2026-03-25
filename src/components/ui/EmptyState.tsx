// =============================================
// components/ui/EmptyState.tsx
// =============================================

import React from 'react'
import { FileX2 } from 'lucide-react'

interface Props {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

const EmptyState: React.FC<Props> = ({
  title = 'Sin resultados',
  description,
  action,
  icon,
}) => (
  <div
    style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'var(--color-surface)',
      border: '0.5px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
    }}
  >
    <div style={{ marginBottom: '1rem', color: 'var(--color-text-3)' }}>
      {icon ?? <FileX2 size={40} style={{ margin: '0 auto' }} />}
    </div>
    <p style={{ fontWeight: 500, color: 'var(--color-text-1)', marginBottom: description ? 6 : 0 }}>
      {title}
    </p>
    {description && (
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-2)', marginBottom: action ? 20 : 0 }}>
        {description}
      </p>
    )}
    {action}
  </div>
)

export default EmptyState
