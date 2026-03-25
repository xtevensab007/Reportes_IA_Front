// =============================================
// pages/NewReportPage.tsx — Wizard container
// =============================================

import React from 'react'
import StepIndicator from '@/components/ui/StepIndicator'
import StepFiles from '@/components/reports/StepFiles'
import StepConfigurator from '@/components/reports/StepConfigurator'
import StepReview from '@/components/reports/StepReview'
import StepExport from '@/components/reports/StepExport'
import { WizardProvider, useWizard } from '@/context/WizardContext'

const WizardContent: React.FC = () => {
  const { currentStep } = useWizard()

  return (
    <div className="page-container fade-in" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Nuevo reporte</h1>
        <p style={{ color: 'var(--color-text-2)', marginTop: 4 }}>
          Sube los archivos, configura la extracción y genera tu reporte PDF.
        </p>
      </div>

      <StepIndicator current={currentStep} />

      <div
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
        }}
      >
        {currentStep === 'files'        && <StepFiles />}
        {currentStep === 'configurator' && <StepConfigurator />}
        {currentStep === 'review'       && <StepReview />}
        {currentStep === 'export'       && <StepExport />}
      </div>
    </div>
  )
}

const NewReportPage: React.FC = () => (
  <WizardProvider>
    <WizardContent />
  </WizardProvider>
)

export default NewReportPage
