# Pista 8 - Backend

API REST y motor de tiempo real de la plataforma **Pista 8**, un sistema de innovación y generación de ideas universitaria. Desarrollado con **NestJS** siguiendo una arquitectura modular estricta que garantiza separación de responsabilidades, escalabilidad y seguridad.

---

## Arquitectura del Sistema

El backend implementa una **arquitectura modular** enfocada en dominios de negocio. Utiliza **PostgreSQL** mediante **Prisma ORM** como fuente principal de verdad, y expone tanto **API REST** como un canal de **WebSockets** bidireccional.

```
                        Cliente (React + Vite)
                               |
               HTTP REST       |       WebSocket (Socket.IO)
          ---------------------+-----------------------
          |                                           |
+---------v-----------+                    +----------v----------+
|    Capa HTTP        |                    |   Capa WebSocket    |
|  Controllers        |                    |   Gateways          |
|  Guards (Firebase)  |                    |   Events            |
+---------+-----------+                    +----------+----------+
          |                                           |
+---------v-------------------------------------------v----------+
|                       Capa de Servicios                        |
|  (Business Logic, Validación, Procesamiento)                   |
+-----------------------------+----------------------------------+
                              |
+-----------------------------v----------------------------------+
|                    Capa de Persistencia                        |
|                     Prisma ORM / Redis                         |
+----------------------------------------------------------------+
```

## Stack Tecnológico

- **Framework**: [NestJS 11](https://nestjs.com/)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: Firebase Admin SDK
- **WebSockets**: Socket.IO
- **Validación y Seguridad**: `class-validator`, `class-transformer`, `helmet`, `throttler`

## Estructura de Directorios

```text
src/
├── common/             # Utilidades compartidas, decoradores, filtros, interceptores
├── config/             # Configuración del sistema (variables de entorno, Joi validation)
├── modules/            # Módulos del dominio de la aplicación
│   ├── admin/          # Gestión de usuarios, métricas y configuración global
│   ├── auth/           # Integración con Firebase y Guards de seguridad
│   ├── challenge/      # Creación y gestión de Retos de Innovación
│   ├── notification/   # Sistema de alertas y notificaciones internas
│   ├── user/           # Perfiles (Estudiante, Juez, Organización, Admin)
│   └── ideation/       # Propuestas, interacciones (likes, comentarios), muro 3D
├── main.ts             # Punto de entrada de la aplicación
└── app.module.ts       # Módulo raíz
```

## Instalación y Ejecución

### 1. Requisitos Previos
- Node.js (v18+)
- PostgreSQL en ejecución
- Variables de entorno configuradas (basadas en `.env.example` o provistas por el administrador)
- Credenciales de Firebase Admin (archivo JSON de cuenta de servicio)

### 2. Configuración del Entorno
Crear un archivo `.env` en la raíz del backend con al menos las siguientes variables:
```env
PORT=3000
DATABASE_URL="postgresql://user:pass@localhost:5432/pista8?schema=public"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Comandos de Inicialización

```bash
# Instalar dependencias
npm install

# Generar el cliente de Prisma
npx prisma generate

# Sincronizar esquemas y poblar la base de datos (Admin inicial)
npm run db:reset

# Levantar el servidor en modo desarrollo
npm run start:dev
```

## Convenciones y Buenas Prácticas

- **Controladores Finos**: Los controladores (`*.controller.ts`) sólo manejan el ruteo HTTP, validación de entrada vía DTOs y formateo de respuesta. No contienen lógica de negocio.
- **Servicios Robustos**: Toda la lógica y reglas de negocio residen en los `*.service.ts`.
- **Inyección de Dependencias**: Todo módulo debe encapsular sus dependencias y exportar estrictamente lo necesario.
- **Seguridad por defecto**: Rutas protegidas mediante `FirebaseAuthGuard`. Validaciones exhaustivas a nivel de red con `ValidationPipe`.

## Comandos Útiles
- `npm run format` - Formatea el código con Prettier
- `npm run lint` - Analiza el código con ESLint
- `npm run build` - Compila la aplicación para producción
