# Pista 8 - Frontend

Interfaz de usuario de la plataforma **Pista 8**. Construida con **React 19 + TypeScript + Vite**, ofrece una experiencia gamificada centrada en la ideacion colaborativa universitaria. Las ideas se representan como aviones en un mural aeronautico interactivo con dinamica visual en tiempo real.

---

## Arquitectura Frontend

La aplicacion implementa una **arquitectura orientada a caracteristicas** (Feature-based Architecture) con separacion clara entre estado global, datos remotos y presentacion.

```
                         main.tsx
                    GlobalStyles + StrictMode
                            |
                        App.tsx
                    BrowserRouter + AuthProvider
                            |
                    GlobalErrorBoundary
                            |
                     AppContent (Routes)
                            |
              +-------------+-------------+
              |             |             |
         /auth         /dashboard/*   /reset-password
         AuthPage      RoleRouter     ResetPasswordPage
                            |
              +------+------+------+
              |      |      |      |
           student  admin  company  judge
              |      |      |      |
      IdeationWall  AdminDash  AdminDash  EvaluationPanel
              |
         SkyCanvas (feature)
              |
    +---------+---------+
    |         |         |
  Planes   Clouds   Modals
  (ideas)  (deco)   (detail+vote)
```

### Capas de la Aplicacion

```
+----------------------------------------------------------+
|  Capa de Presentacion                                    |
|  components/ (por dominio) + features/ (auto-contenidas) |
+---------------------------+------------------------------+
                            |
+---------------------------v------------------------------+
|  Capa de Estado                                          |
|  context/AuthContext (sesion, perfil, token)              |
|  hooks/ (useForm, useDashboardState, useIdeationForm)    |
+---------------------------+------------------------------+
                            |
+---------------------------v------------------------------+
|  Capa de Datos                                           |
|  services/ (auth, challenge, idea, user)                 |
|  api/axiosConfig (interceptor de Authorization)          |
+---------------------------+------------------------------+
                            |
+---------------------------v------------------------------+
|  Capa de Tiempo Real                                     |
|  features/sky-wall/useWallSocket (Socket.IO)             |
+----------------------------------------------------------+
```

### Gestion de Estado

```
Firebase Auth SDK
       |
       v
AuthContext -----> JWT Token -----> Axios Interceptor -----> Backend REST API
       |                                                         |
       v                                                         v
userProfile (rol, facultad, puntos)                      Datos del dominio
       |
       v
RoleRouter (redirige segun rol)
```

| Capa | Tecnologia | Responsabilidad |
|---|---|---|
| Auth Global | Firebase SDK + AuthContext | Sesion, token JWT, login/logout, Google Auth |
| Perfil de Usuario | AuthContext (`userProfile`) | Rol, facultad, puntos (cargado desde PostgreSQL) |
| Estado de UI | Custom Hooks (`useDashboardState`, `useIdeationForm`) | Formularios, carga, navegacion |
| Datos Remotos | API Services (Axios) | Llamadas al backend NestJS |
| Tiempo Real | `useWallSocket` (Socket.IO) | Votacion en vivo, nuevas ideas, sincronizacion |

### Enrutamiento y Control de Acceso

`RoleRouter` evalua `userProfile.role` y redirige automaticamente:

| Rol | Vista principal | Descripcion |
|---|---|---|
| `student` | `IdeationWall` | Muro de ideas con aviones interactivos |
| `admin` | `AdminDashboard` | Panel de control, estadisticas, gestion de retos |
| `company` | `AdminDashboard` | Gestion de retos propios de la empresa |
| `judge` | `EvaluationPanel` | Panel de evaluacion de ideas |
| Sin facultad | `CompleteProfileView` | Onboarding para seleccionar facultad |

---

## Feature: Sky Wall (Mural Aeronautico)

El modulo `features/sky-wall/` es la pieza central de la experiencia del estudiante. Implementa un mural interactivo donde cada idea es un avion cuyo tamano, velocidad y posicion reflejan su popularidad.

### Arquitectura del Feature

```
features/sky-wall/
|-- index.ts                 Barrel export del feature
|-- types.ts                 Tipos compartidos: PlaneIdea, RawIdea, WallPhase, payloads
|-- flight.engine.ts         Motor de dinamica visual (funciones puras)
|-- raw-idea.parser.ts       Parser type-safe para datos crudos de la API
|-- useWallSocket.ts          Hook de Socket.IO: sincronizacion en tiempo real
|-- SkyCanvas.tsx             Orquestador principal: carga, layout, estado
|-- Plane.tsx                 Componente de avion individual (memoizado)
|-- Cloud.tsx                 Decoracion: nubes animadas
|-- IdeasLoader.tsx           Indicador de carga con animacion de pista
|-- IdeasRunwayEmpty.tsx      Estado vacio con animacion de pista 3D
|-- RaceOverlay.tsx           Overlay de "reto finalizado"
|-- PodiumScreen.tsx          Pantalla de podio (top 5 ideas)
|-- components/
    |-- IdeaDetailModal.tsx   Modal de detalle: titulo, problema, solucion
    |-- LikeButton.tsx        Boton de voto aislado con estados de carga
```

### Motor de Dinamica Visual (`flight.engine.ts`)

| Funcion | Input | Output | Efecto visual |
|---|---|---|---|
| `computeScale(likes)` | likesCount | 1.0 - 2.0 | Avion crece con mas likes |
| `computeFloatDuration(likes)` | likesCount | 3.0s - 1.2s | Avion oscila mas rapido con mas likes |
| `computeSize(likes)` | likesCount | 56px - 112px | Tamano base escalado |
| `computeXPosition(comments, width)` | commentsCount, canvasWidth | pixels | Posicion horizontal por comentarios |
| `computeCanvasHeight(count)` | ideaCount | min 600px | Altura del canvas adaptativa |

### Flujo de Votacion (Tiempo Real)

```
1. Usuario hace click en avion -> abre IdeaDetailModal
2. Click en LikeButton -> POST /ideas/:id/like (optimistic update)
3. Backend: transaccion atomica (IdeaLike + increment likesCount)
4. Backend emite Socket event: idea:voted { ideaId, likesCount }
5. useWallSocket recibe evento -> actualiza estado inmutablemente (.map)
6. Plane re-renderiza: nuevo scale, floatDuration, zIndex
7. Modal (si abierto) refleja el nuevo conteo via currentSelectedIdea
```

---

## Estructura del Proyecto

```
frontend/
|-- index.html                      Entry point HTML (Vite)
|-- vite.config.ts                  Configuracion Vite (plugins, alias)
|-- tsconfig.json                   TypeScript config base
|-- tsconfig.app.json               TypeScript config para la app
|-- tsconfig.node.json              TypeScript config para Vite/Node
|-- eslint.config.js                Reglas ESLint (TypeScript + React Hooks)
|-- firebase.json                   Configuracion de Firebase Hosting
|-- .firebaserc                     Proyecto Firebase vinculado
|-- package.json                    Dependencias y scripts npm
|-- pnpm-lock.yaml                  Lockfile de pnpm
|-- .env                            Variables de entorno (no commitear)
|-- .gitignore                      Archivos excluidos de Git
|
|-- public/                         Assets estaticos servidos directamente
|
|-- src/
    |-- main.tsx                    Bootstrap: StrictMode + GlobalStyles + App
    |-- App.tsx                     Router raiz, AuthProvider, RoleRouter, ErrorBoundary
    |-- vite-env.d.ts               Tipos de Vite (import.meta.env)
    |-- setupTests.ts               Configuracion global de tests
    |
    |-- api/                        CAPA HTTP (sin estado)
    |   |-- axiosConfig.ts          Instancia Axios con interceptor de Authorization
    |
    |-- config/                     CONFIGURACION
    |   |-- firebase.ts             Inicializacion del SDK de Firebase
    |   |-- theme.ts                Tokens de diseno: primary, secondary, background
    |   |-- constants.ts            Constantes globales de la app
    |   |-- faculties.ts            Mapa de ID -> nombre de facultad
    |
    |-- context/                    ESTADO GLOBAL (React Context)
    |   |-- AuthContext.tsx          Sesion Firebase, userProfile, token, loading
    |   |-- UserContext.tsx          Contexto adicional de usuario
    |
    |-- services/                   CAPA DE DATOS (funciones de API, una por dominio)
    |   |-- auth.service.ts         Login, registro, logout, reset password
    |   |-- challenge.service.ts    CRUD de retos, estadisticas globales
    |   |-- idea.service.ts         Crear, listar, votar ideas (con cache TTL)
    |   |-- user.service.ts         Perfil, bio, facultad, sincronizacion
    |
    |-- hooks/                      CUSTOM HOOKS GLOBALES
    |   |-- useForm.ts              Hook generico de formularios con validacion
    |
    |-- types/                      TIPOS COMPARTIDOS
    |   |-- models.ts               Role, UserProfile, Challenge, Idea, PaginatedResponse
    |
    |-- styles/                     ESTILOS GLOBALES
    |   |-- GlobalStyles.ts         Reset CSS + estilos base (Styled-Components)
    |
    |-- features/                   FEATURES AUTO-CONTENIDAS
    |   |-- sky-wall/               Mural aeronautico (detallado arriba)
    |
    |-- components/                 COMPONENTES UI (organizados por dominio)
    |   |
    |   |-- admin/
    |   |   |-- AdminDashboard.tsx          Panel de administracion (orquestador)
    |   |   |-- ShareChallenge.tsx          Modal para compartir reto privado
    |   |   |-- AdminDashboard/
    |   |       |-- components/
    |   |       |   |-- AdminSidebar.tsx    Sidebar de navegacion del admin
    |   |       |   |-- ChallengeBuilder.tsx Constructor de retos (editor + preview)
    |   |       |-- hooks/
    |   |       |   |-- useAdminDashboard.ts Estado y logica del panel admin
    |   |       |-- styles/
    |   |           |-- AdminStyles.ts      Styled-Components del panel admin
    |   |
    |   |-- auth/
    |   |   |-- AuthPage.tsx               Login y registro (tabs animadas)
    |   |   |-- CompleteProfileView.tsx     Onboarding de facultad
    |   |   |-- ResetPasswordPage.tsx      Recuperacion de contrasena
    |   |   |-- AuthPage/
    |   |       |-- hooks/
    |   |       |   |-- useAuthForm.ts      Estado del formulario de autenticacion
    |   |       |-- styles/
    |   |           |-- AuthStyles.ts       Styled-Components de autenticacion
    |   |
    |   |-- challenges/
    |   |   |-- PrivateChallengeLoader.tsx  Carga de reto por token de acceso
    |   |
    |   |-- common/
    |   |   |-- BackButton.tsx             Boton de retroceso con animacion
    |   |   |-- RoleGuard.tsx              Componente que oculta/muestra por rol
    |   |   |-- RunwayLoader.tsx           Loader de pantalla completa (pista de aterrizaje)
    |   |
    |   |-- dashboard/
    |   |   |-- IdeationWall.tsx           Muro de ideacion (orquesta sidebar + canvas)
    |   |   |-- LogoutButton.tsx           Boton de cierre de sesion
    |   |   |-- components/
    |   |   |   |-- ChallengeCard.tsx      Tarjeta individual de reto
    |   |   |   |-- ChallengeCardSkeleton.tsx  Placeholder de carga de tarjeta
    |   |   |   |-- ChallengeList.tsx      Lista de retos con filtros
    |   |   |   |-- FeedbackToast.tsx      Toast de retroalimentacion por tono
    |   |   |   |-- IdeaForm.tsx           Formulario de creacion de ideas
    |   |   |   |-- Sidebar.tsx            Sidebar de navegacion del estudiante
    |   |   |   |-- StatsPanel.tsx         Panel de estadisticas y ranking
    |   |   |-- helpers/
    |   |   |   |-- ideaValidation.ts      Validacion de palabras en frontend
    |   |   |-- hooks/
    |   |   |   |-- useDashboardState.ts   Estado global del dashboard
    |   |   |   |-- useIdeationForm.ts     Logica del formulario de ideas
    |   |   |-- styles/
    |   |       |-- ChallengeStyles.ts     Estilos de tarjetas de reto
    |   |       |-- CommonStyles.ts        Constantes compartidas de estilos
    |   |       |-- FeedbackAndMiscStyles.ts  Estilos de toasts y misc
    |   |       |-- FormStyles.ts          Estilos del formulario de ideas
    |   |       |-- LayoutStyles.ts        Layout del dashboard
    |   |       |-- SidebarStyles.ts       Estilos del sidebar
    |   |       |-- SkeletonStyles.ts      Estilos de skeletons de carga
    |   |       |-- StatsStyles.ts         Estilos del panel de estadisticas
    |   |
    |   |-- errors/
    |   |   |-- GlobalErrorBoundary.tsx    Error boundary global de React
    |   |   |-- NotFoundPage.tsx           Pagina 404
    |   |
    |   |-- evaluations/
    |   |   |-- EvaluationPanel.tsx        Vista del juez: lista de ideas a evaluar
    |   |
    |   |-- Form/
    |   |   |-- DynamicForm.tsx            Formulario dinamico configurable
    |   |   |-- FieldFactory.ts            Factory de campos (patron Factory Method)
    |   |   |-- ValidationStrategies.ts    Estrategias de validacion (patron Strategy)
    |   |   |-- ChallengePreview.tsx       Preview del reto en creacion
    |   |
    |   |-- profile/
    |       |-- ProfileView.tsx            Vista de perfil: bio, facultad, puntos, avatar
    |
    |-- assets/                     RECURSOS ESTATICOS
    |   |-- hero.png                Imagen hero de la pagina de auth
    |   |-- logo.png                Logo principal de Pista 8
    |   |-- logo_avion.png          Sprite del avion para el mural
    |
    |-- __tests__/                  TESTS
        |-- App.test.tsx            Test basico de renderizado
        |-- setup.ts               Setup de testing library
```

---

## Patrones de Diseno Implementados

| Patron | Tipo | Donde se aplica |
|---|---|---|
| **Observer** | Comportamiento | `useWallSocket`: suscripcion a eventos Socket.IO |
| **Strategy** | Comportamiento | `ValidationStrategies.ts`: estrategias de validacion intercambiables |
| **Factory Method** | Creacional | `FieldFactory.ts`: genera campos de formulario dinamicamente |
| **Facade** | Estructural | `services/`: encapsulan Axios en interfaces simples por dominio |
| **Module** | Estructural | `features/sky-wall/index.ts`: barrel export, encapsulacion del feature |
| **Memoization** | Comportamiento | `memo()` en Plane, Cloud, PodiumScreen, RaceOverlay, SkyCanvas |
| **Debounce** | Comportamiento | `useWallSocket`: batch de updates con `pendingUpdates` + timer |
| **Container/Presenter** | Estructural | `SkyCanvas` (container) vs `Plane` (presenter puro) |

---

## Sistema de Diseno

### Paleta de Colores

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#FE410A` | Acciones principales, acentos, badges |
| `secondary` | `#485054` | Textos secundarios, bordes |
| `white` | `#FFFFFF` | Fondos, textos sobre oscuro |
| `background` | `#F8F9FA` | Fondo general de la app |
| `error` | `#FF3333` | Estados de error |
| `shadow` | `rgba(72, 80, 84, 0.15)` | Sombras consistentes |

### Convenciones de Estilo

- **CSS-in-JS**: Styled-Components con transient props (`$prop`)
- **Animaciones**: Keyframes de styled-components + Framer Motion para transiciones de pagina
- **Tipografia**: Inter (body), Arial Black (headings de impacto)
- **Iconos**: SVG inline para control total de color y tamano
- **Responsive**: `ResizeObserver` en SkyCanvas para adaptacion del canvas

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|---|---|---|
| Framework UI | React | ^19.2.4 |
| Lenguaje | TypeScript | ~5.9.3 |
| Bundler | Vite | ^8.0.1 |
| Estilos | Styled-Components | ^6.3.12 |
| Animaciones | Framer Motion | ^12.38.0 |
| Navegacion | React Router DOM | ^7.13.2 |
| Autenticacion | Firebase SDK | ^12.11.0 |
| HTTP Client | Axios | ^1.14.0 |
| Tiempo Real | Socket.IO Client | ^4.8.3 |
| Notificaciones | Sonner | ^2.0.7 |
| Testing | Vitest + Testing Library | ^4.1.2 |

---

## Seguridad en el Cliente

- **Domain Filtering**: El registro valida en tiempo real que el correo sea institucional (`@est.univalle.edu`, `@univalle.edu`).
- **Anti-Ghost Accounts**: Al iniciar sesion con Google, se verifica la existencia del usuario en la base de datos. Si no existe, se muestra un modal de advertencia.
- **RBAC en UI**: `RoleGuard` oculta o muestra funcionalidades segun el rol verificado por el backend.
- **Token Management**: El interceptor de Axios obtiene automaticamente un token fresco de Firebase antes de cada request.
- **Optimistic + Server Validation**: El `LikeButton` hace update optimista pero el servidor valida la unicidad. Un 409 del backend actualiza silenciosamente el estado local.
- **LocalStorage Fallback**: Los votos se persisten en localStorage como cache secundario para evitar llamadas innecesarias.

---

## Configuracion y Desarrollo

### Prerrequisitos

- Node.js >= 18
- pnpm

### Instalacion

```bash
pnpm install
```

### Variables de Entorno

Copiar `.env` de ejemplo y completar con credenciales Firebase:

```bash
cp .env.example .env
```

| Variable | Descripcion |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key del proyecto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticacion Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `VITE_FIREBASE_APP_ID` | App ID de Firebase |
| `VITE_API_URL` | URL base del backend (`http://localhost:3000/api`) |

### Comandos

```bash
pnpm run dev          # Servidor de desarrollo con hot-reload
pnpm run build        # Build de produccion (tsc + vite build)
pnpm run preview      # Vista previa del build de produccion
pnpm run test         # Tests unitarios (Vitest)
pnpm run test:watch   # Tests en modo watch
pnpm run lint         # Linting con ESLint
```

---

## Equipo 15

- Franco Leonel Avaro Oliva
- Guilherme da Silva Santana de Almeida
- Roberto Rodriguez Giorgetti

*Proyecto de Sistemas II - UNIVALLE 2026*
