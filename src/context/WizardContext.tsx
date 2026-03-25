// =============================================
// context/WizardContext.tsx — Estado del wizard de nuevo reporte
// =============================================

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { WizardState, WizardStep, UploadedFile, ExtractedField } from '@/types'

type WizardAction =
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_PDF'; payload: UploadedFile | null }
  | { type: 'SET_EXCEL'; payload: UploadedFile | null }
  | { type: 'SET_CONFIGURATOR'; payload: string | null }
  | { type: 'SET_REPORT_NAME'; payload: string }
  | { type: 'SET_EXTRACTED_DATA'; payload: ExtractedField[] }
  | { type: 'UPDATE_FIELD'; payload: { fieldName: string; value: string } }
  | { type: 'SET_REPORT_ID'; payload: string }
  | { type: 'RESET' }

const initialState: WizardState = {
  currentStep: 'files',
  uploadedPdf: null,
  uploadedExcel: null,
  selectedConfiguratorId: null,
  reportName: '',
  extractedData: [],
  reportId: null,
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SET_PDF':
      return { ...state, uploadedPdf: action.payload }
    case 'SET_EXCEL':
      return { ...state, uploadedExcel: action.payload }
    case 'SET_CONFIGURATOR':
      return { ...state, selectedConfiguratorId: action.payload }
    case 'SET_REPORT_NAME':
      return { ...state, reportName: action.payload }
    case 'SET_EXTRACTED_DATA':
      return { ...state, extractedData: action.payload }
    case 'UPDATE_FIELD':
      return {
        ...state,
        extractedData: state.extractedData.map((f) =>
          f.fieldName === action.payload.fieldName
            ? { ...f, value: action.payload.value, needsReview: false }
            : f
        ),
      }
    case 'SET_REPORT_ID':
      return { ...state, reportId: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface WizardContextValue extends WizardState {
  setStep: (step: WizardStep) => void
  setPdf: (file: UploadedFile | null) => void
  setExcel: (file: UploadedFile | null) => void
  setConfigurator: (id: string | null) => void
  setReportName: (name: string) => void
  setExtractedData: (data: ExtractedField[]) => void
  updateField: (fieldName: string, value: string) => void
  setReportId: (id: string) => void
  reset: () => void
  canGoToStep: (step: WizardStep) => boolean
}

const WizardContext = createContext<WizardContextValue | null>(null)

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const stepOrder: WizardStep[] = ['files', 'configurator', 'review', 'export']

  const canGoToStep = useCallback(
    (step: WizardStep): boolean => {
      const idx = stepOrder.indexOf(step)
      const currentIdx = stepOrder.indexOf(state.currentStep)
      if (idx <= currentIdx) return true
      if (step === 'configurator') return !!(state.uploadedPdf && state.uploadedExcel)
      if (step === 'review') return !!(state.selectedConfiguratorId && state.reportId)
      if (step === 'export') return state.extractedData.length > 0
      return false
    },
    [state]
  )

  return (
    <WizardContext.Provider
      value={{
        ...state,
        setStep: (s) => dispatch({ type: 'SET_STEP', payload: s }),
        setPdf: (f) => dispatch({ type: 'SET_PDF', payload: f }),
        setExcel: (f) => dispatch({ type: 'SET_EXCEL', payload: f }),
        setConfigurator: (id) => dispatch({ type: 'SET_CONFIGURATOR', payload: id }),
        setReportName: (n) => dispatch({ type: 'SET_REPORT_NAME', payload: n }),
        setExtractedData: (d) => dispatch({ type: 'SET_EXTRACTED_DATA', payload: d }),
        updateField: (fn, v) => dispatch({ type: 'UPDATE_FIELD', payload: { fieldName: fn, value: v } }),
        setReportId: (id) => dispatch({ type: 'SET_REPORT_ID', payload: id }),
        reset: () => dispatch({ type: 'RESET' }),
        canGoToStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export const useWizard = (): WizardContextValue => {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard debe usarse dentro de WizardProvider')
  return ctx
}
