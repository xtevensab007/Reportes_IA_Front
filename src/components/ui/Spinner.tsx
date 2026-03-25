// =============================================
// components/ui/Spinner.tsx
// =============================================

import React from 'react'

interface Props {
  size?: number
  color?: string
  /** Center in parent container */
  centered?: boolean
  label?: string
}

const Spinner: React.FC<Props> = ({
  size = 20,
  color = 'var(--color-blue)',
  centered = false,
  label,
}) => {
  const el = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          border: `2px solid var(--color-border)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {label && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}>{label}</p>
      )}
    </div>
  )

  if (centered) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '4rem 0',
        }}
      >
        {el}
      </div>
    )
  }

  return el
}

export default Spinner
