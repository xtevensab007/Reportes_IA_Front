// =============================================
// components/ui/Badge.tsx
// =============================================

import React from 'react'
import { cn } from '@/utils'

type Variant = 'green' | 'amber' | 'red' | 'blue' | 'gray'

interface Props {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const Badge: React.FC<Props> = ({ variant = 'gray', children, className }) => (
  <span className={cn('badge', `badge-${variant}`, className)}>{children}</span>
)

export default Badge
