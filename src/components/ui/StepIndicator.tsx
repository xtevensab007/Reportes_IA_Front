// =============================================
// components/ui/StepIndicator.tsx
// =============================================

import React from 'react'
import { Check } from 'lucide-react'
import type { WizardStep } from '@/types'

interface Step {
  key: WizardStep
  label: string
}

const STEPS: Step[] = [
  { key: 'files',        label: 'Archivos' },
  { key: 'configurator', label: 'Configurador' },
  { key: 'review',       label: 'Revisión' },
  { key: 'export',       label: 'Exportar' },
]

interface Props {
  current: WizardStep
}

const StepIndicator: React.FC<Props> = ({ current }) => {
  const currentIdx = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="steps">
      {STEPS.map((step, idx) => {
        const isDone   = idx < currentIdx
        const isActive = idx === currentIdx
        const status   = isDone ? 'done' : isActive ? 'active' : 'inactive'

        return (
          <React.Fragment key={step.key}>
            <div className="step-item">
              <div className={`step-circle ${status}`}>
                {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </div>
              <span className={`step-label ${status}`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`step-line ${idx < currentIdx ? 'done' : idx === currentIdx - 1 ? 'active' : ''}`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default StepIndicator
