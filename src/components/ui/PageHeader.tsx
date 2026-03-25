// =============================================
// components/ui/PageHeader.tsx
// =============================================

import React from 'react'

interface Props {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

const PageHeader: React.FC<Props> = ({ title, subtitle, actions }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.75rem',
    }}
  >
    <div>
      <h1 style={{ marginBottom: subtitle ? 4 : 0 }}>{title}</h1>
      {subtitle && (
        <p style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>{subtitle}</p>
      )}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
  </div>
)

export default PageHeader
