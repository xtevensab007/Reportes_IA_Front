// =============================================
// types/index.ts — Tipos globales de la app
// =============================================

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ---- Reportes ----

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'error'

export interface Report {
  id: string
  name: string
  configuratorId: string
  configuratorName: string
  status: ReportStatus
  pdfFileName: string
  excelFileName: string
  outputUrl?: string
  createdAt: string
  updatedAt: string
  userId: string
  extractedData?: ExtractedField[]
  errorMessage?: string
}

export interface ExtractedField {
  fieldName: string
  source: 'pdf' | 'excel'
  value: string
  confidence?: number
  needsReview: boolean
}

// ---- Configuradores ----

export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'CURRENCY'

export interface PdfField {
  id: string
  name: string
  type: FieldType
  instruction: string
  minConfidence: number
  required: boolean
}

export interface ExcelColumn {
  id: string
  label: string        // era: name
  column: string       // era: columnLetter
  sheet: string        // era: sheetName
  startRow: number
  active: boolean      // era: included
}

export interface Configurator {
  id: string
  name: string
  description?: string
  pdfFields: PdfField[]
  excelColumns: ExcelColumn[]
  includePortada: boolean
  includeDataTable: boolean
  includeOriginalPages: boolean
  includeAiSummary: boolean
  outputFormat: 'A4_vertical' | 'A4_horizontal' | 'pdfa'
  createdAt: string
  updatedAt: string
  userId: string
}

// ---- Upload ----

export interface UploadedFile {
  file: File
  preview?: string
  uploadId?: string
  status: 'idle' | 'uploading' | 'done' | 'error'
  progress: number
  errorMessage?: string
}

// ---- API Responses ----

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
}

// ---- Dashboard ----

export interface DashboardStats {
  totalReports: number
  thisMonth: number
  configurators: number
  inProgress: number
}

// ---- Wizard steps ----

export type WizardStep = 'files' | 'configurator' | 'review' | 'export'

export interface WizardState {
  currentStep: WizardStep
  uploadedPdf: UploadedFile | null
  uploadedExcel: UploadedFile | null
  selectedConfiguratorId: string | null
  reportName: string
  extractedData: ExtractedField[]
  reportId: string | null
}
