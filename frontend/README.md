# ⚡ Pista 8 — Frontend

Interfaz de usuario de la plataforma **Pista 8**. Construida con **React 18 + TypeScript + Vite**, ofrece una experiencia premium centrada en la gamificación y la ideación colaborativa universitaria.

---

## 🏛️ Arquitectura Frontend

La aplicación implementa una **arquitectura orientada a características** (Feature-based) con separación clara entre la capa de estado global (Context), la capa de datos (API Services) y la capa de presentación (Components + Pages).

```
┌──────────────────────────────────────────────────────┐
│                     main.tsx                         │
│              GlobalStyles + StrictMode               │
└───────────────────────┬──────────────────────────────┘
                        │
                ┌───────▼────────┐
                │   App.tsx      │
                │  BrowserRouter │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  AuthProvider  │  ← Firebase session + JWT token
                └───────┬────────┘
                        │
              ┌─────────▼──────────┐
              │  GlobalErrorBound  │
              └─────────┬──────────┘
                        │
           ┌────────────▼────────────────┐
           │     Routes (AppContent)     │
           │  /auth → AuthPage           │
           │  /dashboard/* → RoleRouter  │
           └─────────────────────────────┘
                        │
          ┌─────────────┼──────────────┐
          │             │              │
   ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────────┐
   │ IdeationWall│ │ AdminDash│ │ EvaluationPanel │
   │  (student)  │ │ (admin)  │ │    (judge)      │
   └─────────────┘ └──────────┘ └─────────────────┘
```

### Gestión de Estado

```
Firebase Auth (SDK)
      │
      ▼
AuthContext ──► JWT Token ──► API Services (Axios)
      │                            │
      ▼                            ▼
userProfile (PostgreSQL)     Backend REST API
```

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Auth Global | Firebase SDK + AuthContext | Sesión, token JWT, login/logout |
| Perfil de Usuario | AuthContext (`userProfile`) | Rol, facultad, puntos — cargado desde PostgreSQL |
| Lógica de UI | Custom Hooks | Formularios, estado de pantalla, navegación |
| Datos Remotos | API Services (Axios) | Llamadas al backend NestJS |

### Enrutamiento y Guards

`RoleRouter` evalúa `userProfile.role` y redirige automáticamente:

| Rol | Vista principal |
|---|---|
| `student` | `IdeationWall` (muro de ideas) |
| `admin` | `AdminDashboard` (panel de control) |
| `company` | `AdminDashboard` (gestión de retos propios) |
| `judge` | `EvaluationPanel` (panel de evaluación) |
| Sin facultad | `CompleteProfileView` (onboarding) |

---

## 📁 Estructura del Proyecto

```
frontend/
├── index.html                  # Entry point HTML (Vite)
│
├── src/
│   ├── main.tsx                # Bootstrap: StrictMode + GlobalStyles + App
│   ├── App.tsx                 # Router raíz, AuthProvider, RoleRouter
│   │
│   ├── api/                    # Clientes HTTP (Axios) — no contienen estado
│   │   └── axios.instance.ts   # Instancia base con interceptor de Authorization header
│   │
│   ├── config/
│   │   └── firebase.config.ts  # Inicialización del SDK de Firebase
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Estado global: user (Firebase), userProfile, token, loading
│   │
│   ├── services/               # Funciones de acceso a la API (una por dominio)
│   │   ├── auth.service.ts     # Login, registro, logout
│   │   ├── challenge.service.ts# CRUD de retos, stats globales
│   │   ├── idea.service.ts     # Crear, listar, votar ideas
│   │   └── user.service.ts     # Perfil, bio, facultad, sincronización
│   │
│   ├── hooks/                  # Custom Hooks reutilizables
│   │   ├── useToast.ts         # Wrapper de la librería sonner
│   │   └── useNavigate.ts      # Navegación programática tipada
│   │
│   ├── components/             # Componentes UI organizados por dominio
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx      # Panel de admin: estadísticas y constructor de retos
│   │   ├── auth/
│   │   │   ├── AuthPage.tsx            # Login y registro (tabs)
│   │   │   └── CompleteProfileView.tsx # Onboarding de facultad para nuevos estudiantes
│   │   ├── challenges/                 # Tarjetas, validaciones y filtros de retos
│   │   ├── common/                     # Componentes reutilizables: Botones, Guards, Toasts
│   │   ├── dashboard/
│   │   │   └── IdeationWall.tsx        # Muro de ideas del estudiante
│   │   ├── errors/
│   │   │   └── GlobalErrorBoundary.tsx # Error Boundary para captura global de errores React
│   │   ├── evaluations/
│   │   │   └── EvaluationPanel.tsx     # Vista de juez: listas de ideas a evaluar
│   │   ├── form/                       # Primitivas de formulario reutilizables
│   │   └── profile/
│   │       └── ProfileView.tsx         # Vista de perfil: bio, facultad, puntos
│   │
│   ├── pages/                  # Páginas de nivel superior (si aplica rutas adicionales)
│   │
│   ├── styles/
│   │   └── GlobalStyles.tsx    # Estilos globales inyectados con Styled-Components
│   │
│   ├── types/                  # Tipos e interfaces TypeScript compartidos
│   │
│   └── __tests__/              # Tests unitarios (Vitest)
│       └── setupTests.ts       # Configuración global de tests
│
├── public/                     # Assets estáticos servidos directamente
├── vite.config.ts              # Configuración de Vite (alias, plugins)
├── tsconfig.app.json           # Configuración TypeScript para la app
└── eslint.config.js            # Reglas ESLint (TypeScript + React Hooks)
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | React 18 |
| Lenguaje | TypeScript |
| Bundler | Vite |
| Estilos | Styled-Components (CSS-in-JS) |
| Navegación | React Router DOM v6 |
| Autenticación | Firebase SDK (Google Auth) |
| HTTP Client | Axios |
| Notificaciones | Sonner |
| Testing | Vitest |

---

## 🎨 Sistema de Diseño

La interfaz sigue un lenguaje visual consistente:

- **Color**: Paleta oscura premium con acentos en violeta/índigo (`#6366f1`, `#8b5cf6`).
- **Tipografía**: Inter (Google Fonts) para máxima legibilidad en pantallas de alta densidad.
- **Elevación**: Sombras sutiles y `backdrop-filter: blur()` para glassmorphism.
- **Micro-interacciones**: Animaciones `fadeUp` en aparición de elementos, estados `hover` reactivos, transiciones suaves (`transition: all 0.2s ease`).

---

## 🚀 Configuración y Desarrollo

### Prerrequisitos
- Node.js ≥ 18
- pnpm

### Instalación

```bash
pnpm install
```

### Variables de Entorno

Copiar `.env.example` a `.env` y completar con las credenciales de Firebase:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key del proyecto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `VITE_FIREBASE_APP_ID` | App ID de Firebase |
| `VITE_API_URL` | URL base del backend (`http://localhost:3000/api`) |

### Comandos

```bash
# Servidor de desarrollo con hot-reload
pnpm run dev

# Build de producción
pnpm run build

# Vista previa del build
pnpm run preview

# Tests unitarios
pnpm run test
```

---

## 👥 Equipo 15

- Franco Leonel Avaro Oliva
- Guilherme da Silva Santana de Almeida
- Roberto Rodriguez Giorgetti

*Proyecto de Sistemas II — UNIVALLE 2026*
