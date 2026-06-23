# Pista 8 - Frontend

El cliente web de la plataforma **Pista 8**, diseñado para ofrecer una experiencia interactiva, inmersiva y altamente visual para conectar el talento universitario con los retos del ecosistema empresarial y organizacional.

---

## Arquitectura y Tecnologías

El proyecto fue construido como una SPA (Single Page Application) utilizando las herramientas más modernas del ecosistema de React, poniendo un fuerte enfoque en el rendimiento, la escalabilidad del código y la interactividad en tiempo real (Pared de Ideación).

### Stack Tecnológico
- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Lenguaje**: TypeScript
- **Estilos y UI**: `styled-components`, animaciones con `framer-motion`
- **Autenticación**: Firebase Auth
- **Tiempo Real**: `socket.io-client`
- **Gráficos y Exportación**: `recharts` (Métricas), `jspdf` + `html2canvas` (Exportación de perfiles)
- **Notificaciones**: `sonner`

## Estructura de Directorios

El frontend sigue una arquitectura basada en **Features** (Características). En lugar de separar el código por tipo técnico (todos los componentes juntos, todos los hooks juntos), se agrupa por funcionalidad de negocio.

```text
src/
├── assets/             # Imágenes estáticas, logos y fuentes locales
├── components/         # Componentes genéricos de UI (Botones, Modales, Spinners)
├── config/             # Configuración global, temas de color (theme.ts)
├── context/            # Proveedores de estado global (AuthContext.tsx)
├── features/           # Código agrupado por dominio de negocio:
│   ├── admin/          # Panel de soporte técnico y control de usuarios
│   ├── dashboard/      # Vista principal, formularios de retos y gestión de jueces
│   ├── profile/        # Edición y vista de perfiles (Participante, Organización)
│   └── sky-wall/       # El "Muro de Ideación": Renderizado interactivo y WebSockets
├── hooks/              # Hooks globales reutilizables (useActiveFaculties, etc.)
├── layouts/            # Estructuras de página (MainLayout con Sidebar)
├── pages/              # Entradas principales del Router
├── routes/             # Definición de rutas y Guards de navegación
├── services/           # Clientes API para conectar con el Backend de NestJS
├── types/              # Interfaces y tipos globales de TypeScript
└── utils/              # Funciones puras utilitarias y formateadores
```

## Componentes Destacados

1. **Sky Wall (El Muro de Ideación)**:
   Un canvas interactivo y visualmente denso (`features/sky-wall`) que representa las ideas subidas a los retos como "aviones de papel" que flotan en la pantalla.
   - Reacciona en **tiempo real** gracias a WebSockets (`useWallSocket.ts`).
   - Los aviones cambian de tamaño y comportamiento dinámicamente basados en sus interacciones ("likes").
   - Colores autogenerados dependiendo del área u organización al que pertenece la idea.

2. **Dashboard Multipropósito**:
   La interfaz se adapta radicalmente dependiendo del rol logueado (`features/dashboard/views`):
   - **Participantes**: Ven el muro de retos, pueden subir ideas y editar su perfil de innovador.
   - **Organizaciones**: Tienen acceso al creador de retos, gestión de estados (Fase de Ideas, Finalistas, Cierre) y asignación de jueces.
   - **Jueces**: Ven un panel especializado para calificar las ideas finalistas de manera técnica.
   - **Admin / Soporte Técnico**: Gestionan las métricas globales, áreas del sistema y accesos institucionales.

## Instalación y Ejecución

### 1. Requisitos Previos
- Node.js (v18+)

### 2. Configuración del Entorno
Crear un archivo `.env` en la raíz del frontend:
```env
VITE_API_URL="http://localhost:3000/api"
VITE_SOCKET_URL="http://localhost:3000"

# Credenciales Públicas de Firebase
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tu-proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcd"
```

### 3. Comandos Principales

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Hot-Reload (Vite)
npm run dev

# Compilar para producción (TypeScript Check + Vite Build)
npm run build

# Analizar código con ESLint
npm run lint
```
