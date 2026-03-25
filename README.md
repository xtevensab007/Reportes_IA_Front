# ReportAI — Frontend

Plataforma web para generación de reportes PDF inteligentes usando IA.  
Extrae datos de archivos PDF (via API de IA) y los combina con datos de Excel para generar un PDF unificado.

---

## Stack

- **React 18** + **TypeScript**
- **Vite** (bundler/dev server)
- **React Router v6** (navegación)
- **Axios** (HTTP client con interceptores y refresh token)
- **React Dropzone** (carga de archivos drag & drop)
- **React Hot Toast** (notificaciones)
- **Lucide React** (íconos)

---

## Estructura del proyecto

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Guard de rutas privadas
│   ├── layout/
│   │   ├── AppLayout.tsx           # Layout con sidebar
│   │   └── Sidebar.tsx             # Navegación lateral
│   ├── reports/
│   │   ├── StepFiles.tsx           # Wizard paso 1: subir archivos
│   │   ├── StepConfigurator.tsx    # Wizard paso 2: config extracción
│   │   ├── StepReview.tsx          # Wizard paso 3: revisar datos
│   │   └── StepExport.tsx          # Wizard paso 4: exportar PDF
│   └── ui/
│       ├── Badge.tsx               # Pill de estado
│       ├── FileDropzone.tsx        # Drop zone PDF/Excel
│       ├── Modal.tsx               # Modal reutilizable
│       └── StepIndicator.tsx       # Indicador de pasos del wizard
├── context/
│   ├── AuthContext.tsx             # Estado de autenticación global
│   └── WizardContext.tsx           # Estado del wizard de nuevo reporte
├── pages/
│   ├── LoginPage.tsx               # Login + OAuth Google/GitHub
│   ├── OAuthCallbackPage.tsx       # Callback OAuth (recibe code)
│   ├── DashboardPage.tsx           # Dashboard con métricas
│   ├── NewReportPage.tsx           # Wizard de nuevo reporte
│   ├── ReportsPage.tsx             # Lista de reportes con filtros
│   ├── ConfiguratorsPage.tsx       # CRUD de plantillas/configuradores
│   └── SettingsPage.tsx            # Ajustes de perfil
├── services/
│   ├── api.ts                      # Axios instance + interceptores + refresh
│   ├── authService.ts              # Login, OAuth, logout, perfil
│   ├── reportService.ts            # CRUD reportes, upload, download
│   └── configuratorService.ts      # CRUD configuradores
├── types/
│   └── index.ts                    # Tipos TypeScript globales
├── utils/
│   └── index.ts                    # Helpers (fechas, tamaños, colores)
├── styles/
│   └── global.css                  # Design system con variables CSS
├── App.tsx                         # Router principal (todas las rutas)
└── main.tsx                        # Entry point
```

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Editar .env.local con tus valores
# - VITE_API_URL: URL de tu backend (ej: http://localhost:8000)
# - VITE_GOOGLE_CLIENT_ID: Client ID de Google OAuth
# - VITE_GITHUB_CLIENT_ID: Client ID de GitHub OAuth

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en **http://localhost:3000**

---

## Variables de entorno

| Variable               | Descripción                            | Ejemplo                          |
|------------------------|----------------------------------------|----------------------------------|
| `VITE_API_URL`         | URL base del backend                   | `http://localhost:8000`          |
| `VITE_GOOGLE_CLIENT_ID`| Client ID de Google OAuth 2.0          | `xxx.apps.googleusercontent.com` |
| `VITE_GITHUB_CLIENT_ID`| Client ID de GitHub OAuth              | `Ov23li...`                      |
| `VITE_APP_NAME`        | Nombre de la app (opcional)            | `ReportAI`                       |

---

## Rutas de la aplicación

| Ruta                          | Página               | Protegida |
|-------------------------------|----------------------|-----------|
| `/login`                      | Login / OAuth        | No        |
| `/auth/callback/:provider`    | OAuth callback       | No        |
| `/dashboard`                  | Dashboard            | Sí        |
| `/reports`                    | Lista de reportes    | Sí        |
| `/reports/new`                | Nuevo reporte (wizard)| Sí       |
| `/configurators`              | Configuradores       | Sí        |
| `/settings`                   | Ajustes              | Sí        |

---

## Endpoints del backend esperados

El frontend llama a los siguientes endpoints. El backend debe implementarlos:

### Auth
```
POST   /api/auth/login          { email, password } → { user, tokens }
POST   /api/auth/oauth/google   { code, redirectUri } → { user, tokens }
POST   /api/auth/oauth/github   { code, redirectUri } → { user, tokens }
GET    /api/auth/me             → User
POST   /api/auth/logout         → 200
POST   /api/auth/refresh        { refreshToken } → { tokens }
```

### Reports
```
GET    /api/reports/stats       → DashboardStats
GET    /api/reports             ?page&pageSize → PaginatedResponse<Report>
GET    /api/reports/:id         → Report
POST   /api/reports             { name, configuratorId, pdfUploadId, excelUploadId } → Report
PATCH  /api/reports/:id/fields  { fieldName, value } → ExtractedField[]
POST   /api/reports/:id/generate → { outputUrl }
GET    /api/reports/:id/download → Blob (PDF)
DELETE /api/reports/:id         → 200
```

### Uploads
```
POST   /api/uploads             FormData(file, type) → { uploadId, fileName }
```

### Configurators
```
GET    /api/configurators       → Configurator[]
GET    /api/configurators/:id   → Configurator
POST   /api/configurators       Configurator → Configurator
PUT    /api/configurators/:id   Partial<Configurator> → Configurator
DELETE /api/configurators/:id   → 200
```

---

## Build para producción

```bash
npm run build
# Output en /dist
```

---

## Decisiones de arquitectura

- **AuthContext**: maneja la sesión con `useReducer`. Restaura automáticamente la sesión desde `localStorage` al montar.
- **Axios interceptores**: el token JWT se adjunta automáticamente a cada request. Si el backend responde 401, se intenta refrescar el token silenciosamente.
- **WizardContext**: estado del wizard de nuevo reporte aislado en su propio contexto. Se reinicia al navegar fuera.
- **Lazy loading**: todas las páginas usan `React.lazy` + `Suspense` para reducir el bundle inicial.
- **Proxy de Vite**: en desarrollo, las llamadas a `/api/*` se redirigen al backend configurado en `VITE_API_URL`, evitando problemas de CORS.
