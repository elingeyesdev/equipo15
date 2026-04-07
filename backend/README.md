# 🚀 Pista 8 — Backend

Núcleo lógico y API REST de la plataforma **Pista 8**, una plataforma de innovación y generación de ideas universitaria. Desarrollado con **NestJS** siguiendo una arquitectura de capas estricta que garantiza separación de responsabilidades, escalabilidad y mantenibilidad.

---

## 🏛️ Arquitectura del Sistema

El backend implementa una **arquitectura de capas** (Layered Architecture) organizada en tres capas principales: HTTP, Business Logic y Persistence. Adicionalmente emplea una **base de datos híbrida** para distintos dominios de datos.

```
┌──────────────────────────────────────────────────┐
│                  Cliente (React)                 │
└───────────────────┬──────────────────────────────┘
                    │ HTTP / WebSocket
┌───────────────────▼──────────────────────────────┐
│              NestJS — Capa HTTP                  │
│  Controllers · Guards · Interceptors · Filters   │
└───────────────────┬──────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────┐
│           Capa de Lógica de Negocio              │
│               Services (DI)                      │
└───────────────────┬──────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────┐
│             Capa de Persistencia                 │
│  Repositories (Prisma) · Mongoose Documents      │
└────────────┬────────────────────┬────────────────┘
             │                    │
    ┌────────▼────────┐   ┌───────▼────────┐
    │  PostgreSQL     │   │  MongoDB Atlas │
    │  (Supabase)     │   │  (Contenido    │
    │  Usuarios,Roles │   │   enriquecido) │
    │  Ideas, Retos   │   │ ProjectDetails │
    └─────────────────┘   └────────────────┘
```

### Base de Datos Híbrida

| Motor | Propósito | ORM/Driver |
|---|---|---|
| **PostgreSQL** (Supabase) | Entidades relacionales: Users, Roles, Challenges, Ideas, Evaluations | Prisma |
| **MongoDB Atlas** | Contenido enriquecido: ProjectDetails (multimedia, tags extendidos) | Mongoose |

### Flujo de una Petición

```
Request → FirebaseAuthGuard (verifica JWT Firebase) 
        → RolesGuard (verifica rol en BD) 
        → Controller → Service → Repository → BD
        → TransformInterceptor (envuelve respuesta en { success, data })
        → Response
```

---

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma       # Modelos relacionales: User, Role, Challenge (authorId), Idea, Evaluation
│   ├── seed.ts             # Script de inicialización: admin, judge, student, company
│   └── migrations/         # Historial de migraciones de Prisma
│
├── src/
│   ├── main.ts             # Bootstrap: CORS, Helmet, ValidationPipe, Swagger, ThrottlerModule
│   ├── app.module.ts       # Módulo raíz: importa todos los submódulos globales
│   │
│   ├── app/
│   │   ├── DTOs/           # Data Transfer Objects: validación y tipado de entradas
│   │   │   ├── create-challenge.dto.ts
│   │   │   ├── create-idea.dto.ts
│   │   │   ├── create-draft-idea.dto.ts
│   │   │   ├── create-user.dto.ts
│   │   │   ├── create-evaluation.dto.ts
│   │   │   └── update-*.dto.ts
│   │   │
│   │   ├── Gateways/
│   │   │   └── events.gateway.ts       # WebSocket Gateway autenticado con Firebase
│   │   │
│   │   ├── Http/
│   │   │   └── Controllers/            # Controladores REST (una ruta por dominio)
│   │   │       ├── challenges.controller.ts
│   │   │       ├── evaluations.controller.ts
│   │   │       ├── health.controller.ts
│   │   │       ├── ideas.controller.ts
│   │   │       └── users.controller.ts
│   │   │
│   │   ├── Models/
│   │   │   └── challenge-status.enum.ts # Enum de estados de reto
│   │   │
│   │   ├── Providers/                  # Módulos de NestJS (DI containers)
│   │   │   ├── database.module.ts      # Exporta PrismaService globalmente
│   │   │   ├── database.service.ts     # PrismaService (extiende PrismaClient)
│   │   │   ├── http.module.ts          # Ensambla controladores con ServicesModule
│   │   │   ├── repositories.module.ts  # Exporta todos los Repositories
│   │   │   └── services.module.ts      # Exporta todos los Services
│   │   │
│   │   ├── Repositories/              # Capa de acceso a datos (patrón Repository)
│   │   │   ├── base.repository.ts
│   │   │   ├── challenge.repository.ts
│   │   │   ├── evaluation.repository.ts
│   │   │   ├── idea.repository.ts
│   │   │   ├── role.repository.ts
│   │   │   └── user.repository.ts
│   │   │
│   │   ├── Services/                  # Lógica de negocio (orquesta Repositories)
│   │   │   ├── challenge.service.ts
│   │   │   ├── evaluation.service.ts
│   │   │   ├── idea.service.ts
│   │   │   └── user.service.ts
│   │   │
│   │   └── Utils/                     # Utilidades puras (sin dependencias de NestJS)
│   │       ├── email-parser.util.ts   # Detecta facultad desde el dominio del email
│   │       ├── faculty.dictionary.ts  # Mapa de keywords → ID de facultad
│   │       └── user-metadata.util.ts  # Listas blancas de admins/jueces y lógica de rol
│   │
│   ├── common/                        # Infraestructura transversal
│   │   ├── dto/
│   │   │   └── pagination.dto.ts      # DTO reutilizable para paginación (page, limit)
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts          # Captura todas las HttpExceptions
│   │   │   └── prisma-client-exception.filter.ts # Mapea errores P2002/P2025/P2003 a HTTP
│   │   ├── guards/
│   │   │   ├── firebase-auth.guard.ts  # Verifica el Bearer token con Firebase Admin SDK
│   │   │   ├── roles.decorator.ts      # Decorador @Roles('admin', 'judge')
│   │   │   ├── roles.guard.ts          # Comprueba el rol del usuario en PostgreSQL
│   │   │   └── ws-firebase-auth.guard.ts # Guard equivalente para WebSockets
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts # Envuelve toda respuesta en { success, data }
│   │   └── validators/
│   │       └── is-allowed-domain.validator.ts # Valida que el email sea de dominio permitido
│   │
│   ├── config/
│   │   └── firebase-admin.module.ts   # Inicializa Firebase Admin SDK como módulo global
│   │
│   └── database/
│       └── schemas/
│           └── project-details.schema.ts # Schema Mongoose para contenido enriquecido de ideas
│
└── test/                              # Tests end-to-end (Vitest / Jest)
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | NestJS (Node.js) |
| Lenguaje | TypeScript |
| BD Relacional | PostgreSQL vía Supabase |
| BD Documento | MongoDB Atlas |
| ORM Relacional | Prisma |
| ODM Documento | Mongoose |
| Autenticación | Firebase Admin SDK (JWT) |
| Validación | class-validator & class-transformer |
| Rate Limiting | @nestjs/throttler |
| Seguridad HTTP | Helmet |
| Tiempo Real | Socket.IO (via @nestjs/websockets) |
| Documentación | Swagger / OpenAPI (`/docs`) |

---

## 🔐 Seguridad

- **Helmet**: cabeceras HTTP seguras en todas las rutas.
- **ThrottlerGuard**: límite de 300 peticiones por minuto por IP (global).
- **FirebaseAuthGuard**: valida el token Bearer con el SDK de Firebase Admin en cada request protegida.
- **RolesGuard**: consulta el perfil del usuario en PostgreSQL para verificar si su rol cumple el requisito del endpoint (`@Roles('admin', 'company', 'judge')`).
- **IsAllowedDomainValidator**: el registro solo acepta emails `@univalle.edu`, `@est.univalle.edu` o `@pista8.com`.
- **ValidationPipe** global: `whitelist: true`, `forbidNonWhitelisted: true` — rechaza cualquier campo no declarado en los DTOs.

---

## 🚀 Configuración y Despliegue

### Prerrequisitos
- Node.js ≥ 18
- pnpm
- Acceso a Supabase (PostgreSQL) y MongoDB Atlas
- Proyecto de Firebase con SDK Admin habilitado

### Instalación

```bash
pnpm install
```

### Variables de Entorno

Copiar `.env.example` a `.env` y completar los valores:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de Supabase con PgBouncer (puerto 6543) para uso normal |
| `DIRECT_URL` | URL directa de Supabase (puerto 5432) para migraciones Prisma |
| `MONGO_URI` | URI de conexión a MongoDB Atlas |
| `FRONTEND_URL` | URL del frontend (para CORS y WebSocket) |
| `PORT` | Puerto del servidor (default: 3000) |

### Credenciales Firebase

Colocar el archivo `firebase-admin.json` (Service Account) en el directorio raíz del backend. **Nunca commitear este archivo** (ya está en `.gitignore`).

### Comandos

```bash
# Aplicar migraciones a la BD
pnpm prisma migrate deploy

# Sembrar datos iniciales (roles)
pnpm prisma db seed

# Desarrollo con hot-reload
pnpm run start:dev

# Build de producción
pnpm run build

# Producción
pnpm run start:prod
```

La documentación Swagger estará disponible en: `http://localhost:3000/docs`

---

## 👥 Equipo 15

- Franco Leonel Avaro Oliva
- Guilherme da Silva Santana de Almeida
- Roberto Rodriguez Giorgetti

*Proyecto de Sistemas II — UNIVALLE 2026*
