# Pista 8 - Backend

API REST y motor de tiempo real de la plataforma **Pista 8**, un sistema de innovacion y generacion de ideas universitaria. Desarrollado con **NestJS** siguiendo una arquitectura de capas estricta que garantiza separacion de responsabilidades, escalabilidad y mantenibilidad.

---

## Arquitectura del Sistema

El backend implementa una **arquitectura de capas** (Layered Architecture) organizada en tres capas principales: HTTP, Business Logic y Persistence. Emplea una **base de datos hibrida** (PostgreSQL + MongoDB) y un canal de **tiempo real** via WebSocket.

```
                        Cliente (React + Vite)
                               |
               HTTP REST       |       WebSocket (Socket.IO)
          ---------------------+-----------------------
          |                                           |
+---------v-----------+                    +----------v----------+
|    Capa HTTP        |                    |   Capa WebSocket    |
|  Controllers        |                    |   EventsGateway     |
|  Guards (Auth+Roles) |                    |   Firebase Auth     |
|  Interceptors        |                    +----------+----------+
|  Filters             |                               |
+---------+-----------+                                |
          |                                            |
+---------v--------------------------------------------v----+
|                  Capa de Logica de Negocio                |
|                     Services (DI)                         |
|  IdeaService / ChallengeService / UserService / etc.      |
+---------+------------------------------------------------+
          |
+---------v-----------+
|   Capa de Datos     |
|   Repositories      |
|   (Patron Repository)|
+---------+-----------+
          |
    ------+------
    |           |
+---v---+  +----v-----+
| Prisma|  | Mongoose  |
+---+---+  +----+------+
    |           |
+---v---+  +----v--------+
| Postgre|  | MongoDB     |
| SQL    |  | Atlas       |
+--------+  +-------------+
```

### Flujo de una Peticion HTTP

```
Request
  -> Helmet (cabeceras de seguridad)
  -> ThrottlerGuard (rate limiting por IP)
  -> FirebaseAuthGuard (verifica JWT via Firebase Admin SDK)
  -> RolesGuard (verifica rol del usuario en PostgreSQL)
  -> ValidationPipe (valida DTOs con class-validator)
  -> Controller (delega al Service)
  -> Service (ejecuta logica de negocio)
  -> Repository (accede a la base de datos)
  -> TransformInterceptor (envuelve la respuesta en { success, data })
  -> HttpExceptionFilter / PrismaExceptionFilter (manejo de errores)
  -> Response
```

### Flujo WebSocket (Tiempo Real)

```
Cliente conecta con token Firebase
  -> EventsGateway.handleConnection()
  -> Verifica token con Firebase Admin SDK
  -> Conexion aceptada o rechazada
  -> El servicio emite eventos al Server de Socket.IO:
     - idea:voted    -> Actualiza likesCount en todos los clientes
     - idea_created  -> Agrega avion al mural en todos los clientes
     - idea_commented -> Notifica nuevo comentario
     - challenge:close -> Activa la fase de carrera/podio
     - timer:sync    -> Sincroniza reloj del servidor
```

### Base de Datos Hibrida

| Motor | Proposito | ORM/Driver | Justificacion |
|---|---|---|---|
| **PostgreSQL** (Supabase) | Entidades relacionales: Users, Roles, Challenges, Ideas, IdeaLikes, Evaluations | Prisma | Integridad referencial, transacciones ACID, constraints unique |
| **MongoDB** (Atlas) | Contenido enriquecido: ProjectDetails (multimedia, tags dinamicos) | Mongoose | Flexibilidad de esquema, escalabilidad horizontal para documentos grandes |

---

## Estructura del Proyecto

```
backend/
|-- prisma/
|   |-- schema.prisma           Modelos relacionales (6 tablas, indices, constraints)
|   |-- seed.ts                 Datos iniciales: roles (admin, judge, student, company)
|   |-- migrations/             Historial de migraciones incrementales
|
|-- test/                                      TESTS END-TO-END
|   |-- app.e2e-spec.ts                        Test E2E del health check
|   |-- jest-e2e.json                          Configuracion Jest para E2E
|
|-- src/
|   |-- main.ts                 Bootstrap: CORS, Helmet, ValidationPipe, Swagger, Throttler
|   |-- app.module.ts           Modulo raiz: ensambla todos los submodulos globales
|   |
|   |-- app/                    CAPA DE APLICACION (dominio del negocio)
|   |   |
|   |   |-- Http/
|   |   |   |-- Controllers/
|   |   |       |-- challenges.controller.ts    CRUD de retos, acceso privado por token
|   |   |       |-- evaluations.controller.ts   Evaluacion de ideas por jueces
|   |   |       |-- health.controller.ts        Health check para monitoreo
|   |   |       |-- ideas.controller.ts         CRUD de ideas, endpoint /like atomico
|   |   |       |-- users.controller.ts         Registro, perfil, sincronizacion
|   |   |
|   |   |-- Services/                          Logica de negocio (orquesta Repositories)
|   |   |   |-- challenge.service.ts           Ciclo de vida del reto, estadisticas
|   |   |   |-- evaluation.service.ts          Persistencia de evaluaciones
|   |   |   |-- idea.service.ts                Creacion, votacion atomica, emision de eventos
|   |   |   |-- user.service.ts                Registro hibrido, deteccion de facultad
|   |   |
|   |   |-- Repositories/                     Capa de acceso a datos (Patron Repository)
|   |   |   |-- base.repository.ts             Contrato abstracto para repositorios
|   |   |   |-- challenge.repository.ts        Queries de retos con paginacion
|   |   |   |-- evaluation.repository.ts       Persistencia de evaluaciones
|   |   |   |-- idea.repository.ts             Transacciones atomicas, inyeccion hasVoted
|   |   |   |-- role.repository.ts             Busqueda de roles por nombre
|   |   |   |-- user.repository.ts             Upsert de usuarios, busqueda por UID/email
|   |   |
|   |   |-- DTOs/                              Data Transfer Objects (validacion de entrada)
|   |   |   |-- create-challenge.dto.ts        Validacion de retos (fechas, dominios, etc.)
|   |   |   |-- create-challenge.dto.spec.ts   Tests unitarios del DTO de retos
|   |   |   |-- create-idea.dto.ts             Validacion de ideas (titulo, problema, solucion)
|   |   |   |-- create-draft-idea.dto.ts       Validacion parcial para borradores
|   |   |   |-- create-evaluation.dto.ts       Validacion de evaluaciones (score, feedback)
|   |   |   |-- create-user.dto.ts             Validacion de registro (email, displayName)
|   |   |   |-- update-challenge.dto.ts        Actualizacion parcial de reto (PartialType)
|   |   |   |-- update-evaluation.dto.ts       Actualizacion parcial de evaluacion
|   |   |   |-- update-idea.dto.ts             Actualizacion parcial de idea
|   |   |   |-- update-user.dto.ts             Actualizacion parcial de usuario
|   |   |
|   |   |-- Gateways/                          Canal WebSocket (Socket.IO)
|   |   |   |-- events.gateway.ts              Gateway autenticado con Firebase, emision de eventos
|   |   |   |-- events.module.ts               Modulo global para inyeccion del gateway
|   |   |
|   |   |-- Models/                            Enums y constantes del dominio
|   |   |   |-- challenge-status.enum.ts       Borrador, Activo, En Evaluacion, Finalizado
|   |   |
|   |   |-- Providers/                         Modulos NestJS (contenedores de DI)
|   |   |   |-- database.module.ts             Exporta PrismaService globalmente
|   |   |   |-- database.service.ts            PrismaService (extiende PrismaClient)
|   |   |   |-- http.module.ts                 Ensambla Controllers + ServicesModule
|   |   |   |-- repositories.module.ts         Registra y exporta todos los Repositories
|   |   |   |-- services.module.ts             Registra y exporta todos los Services
|   |   |
|   |   |-- Utils/                             Funciones puras (sin dependencias de NestJS)
|   |       |-- email-parser.util.ts           Detecta facultad desde dominio del email
|   |       |-- faculty.dictionary.ts          Diccionario keyword -> ID de facultad
|   |       |-- idea-validation.util.ts        Validacion de rango de palabras por campo
|   |       |-- user-metadata.util.ts          Listas blancas de admins/jueces, logica de rol
|   |
|   |-- common/                                INFRAESTRUCTURA TRANSVERSAL (cross-cutting)
|   |   |
|   |   |-- dto/
|   |   |   |-- pagination.dto.ts              DTO reutilizable: page, limit, challengeId
|   |   |
|   |   |-- filters/
|   |   |   |-- http-exception.filter.ts       Captura HttpExceptions, formato uniforme
|   |   |   |-- prisma-client-exception.filter.ts  Mapea P2002/P2025/P2003 a HTTP 409/404/400
|   |   |
|   |   |-- guards/
|   |   |   |-- firebase-auth.guard.ts         Verifica Bearer token con Firebase Admin SDK
|   |   |   |-- roles.decorator.ts             Decorador @Roles('admin', 'judge')
|   |   |   |-- roles.guard.ts                Comprueba rol del usuario en PostgreSQL
|   |   |   |-- ws-firebase-auth.guard.ts      Guard equivalente para conexiones WebSocket
|   |   |
|   |   |-- interceptors/
|   |   |   |-- transform.interceptor.ts       Envuelve toda respuesta en { success, data }
|   |   |
|   |   |-- types/
|   |   |   |-- authenticated-request.interface.ts  Extiende Express.Request con DecodedIdToken
|   |   |
|   |   |-- validators/                        Decoradores de validacion personalizados
|   |       |-- has-unique-words.decorator.ts   Valida diversidad de vocabulario
|   |       |-- is-allowed-domain.validator.ts  Valida dominio institucional del email
|   |       |-- is-within-six-months.decorator.ts  Valida rango de fechas
|   |       |-- no-excessive-symbols.decorator.ts  Previene spam de simbolos
|   |       |-- no-insecure-urls.decorator.ts  Rechaza URLs HTTP inseguras
|   |       |-- no-numbers.decorator.ts        Rechaza campos con numeros
|   |
|   |-- config/                                CONFIGURACION EXTERNA
|   |   |-- firebase-admin.module.ts           Inicializa Firebase Admin SDK como modulo global
|   |
|   |-- database/                              ESQUEMAS NO-RELACIONALES
|       |-- schemas/
|           |-- project-details.schema.ts      Schema Mongoose: multimedia, tags, descripcion
|
|-- .env                                       Variables de entorno (no commitear)
|-- .env.example                               Plantilla de variables de entorno
|-- .gitignore                                 Archivos excluidos de Git
|-- .prettierrc                                Configuracion de Prettier
|-- eslint.config.mjs                          Reglas ESLint (TypeScript + Prettier)
|-- firebase-admin.json                        Credenciales Firebase (NO commitear)
|-- nest-cli.json                              Configuracion del CLI de NestJS
|-- package.json                               Dependencias y scripts npm
|-- pnpm-lock.yaml                             Lockfile de pnpm
|-- tsconfig.json                              Configuracion base de TypeScript
|-- tsconfig.build.json                        Configuracion TypeScript para build de produccion
```

---

## Patrones de Diseno Implementados

| Patron | Tipo | Donde se aplica |
|---|---|---|
| **Repository** | Estructural | `Repositories/` abstrae Prisma/Mongoose del servicio |
| **Dependency Injection** | Creacional | NestJS `@Injectable()` en Services, Repos, Guards |
| **Observer** | Comportamiento | Socket.IO: servicios emiten eventos, clientes los escuchan |
| **Guard (Chain of Responsibility)** | Comportamiento | `FirebaseAuthGuard` -> `RolesGuard` -> Controller |
| **Interceptor (Decorator)** | Estructural | `TransformInterceptor` envuelve respuestas uniformemente |
| **Module (Facade)** | Estructural | `ServicesModule`, `RepositoriesModule` agrupan dependencias |
| **Strategy** | Comportamiento | Validadores custom (`HasUniqueWords`, `IsAllowedDomain`) |
| **Template Method** | Comportamiento | `BaseRepository` define contrato, implementaciones concretas lo extienden |

---

## Modelo de Datos (Prisma)

```
Role  1---*  User  1---*  Idea  1---*  Evaluation
                    |         |
                    |         *---1  IdeaLike
                    |         |
                    *---1  Challenge
                    |         |
                    *---------* (UserAccessedPrivateChallenges)
```

| Tabla | Campos clave | Indices |
|---|---|---|
| `Role` | id, name (unique) | - |
| `User` | id, firebaseUid (unique), email (unique), roleId, facultyId | - |
| `Challenge` | id, title, status, authorId, accessToken (unique), isPrivate | - |
| `Idea` | id, title, problem, solution, status, likesCount, authorId, challengeId | challengeId, authorId, status |
| `IdeaLike` | id, ideaId, userId | **@@unique([ideaId, userId])**, ideaId, userId |
| `Evaluation` | id, ideaId, judgeId, score, feedback | ideaId, judgeId |

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|---|---|---|
| Framework | NestJS | ^11.0.1 |
| Lenguaje | TypeScript | ^5.7.3 |
| BD Relacional | PostgreSQL via Supabase | - |
| BD Documento | MongoDB Atlas | - |
| ORM Relacional | Prisma | 6.2.1 |
| ODM Documento | Mongoose | ^9.3.3 |
| Autenticacion | Firebase Admin SDK | ^13.7.0 |
| Validacion | class-validator + class-transformer | ^0.15.1 |
| Rate Limiting | @nestjs/throttler | ^6.5.0 |
| Seguridad HTTP | Helmet | ^8.1.0 |
| Tiempo Real | Socket.IO (@nestjs/websockets) | ^4.8.3 |
| Documentacion API | Swagger / OpenAPI | /docs |
| Testing | Jest | ^30.0.0 |

---

## Seguridad

### Autenticacion (Authentication)

- **FirebaseAuthGuard**: Valida el Bearer token JWT emitido por Firebase en cada peticion HTTP. Extrae `DecodedIdToken` y lo inyecta en `request.user`.
- **WS Firebase Auth**: Equivalente para WebSocket. Verifica el token en `client.handshake.auth.token` al momento de la conexion.

### Autorizacion (Authorization)

- **RolesGuard + @Roles()**: Autoriza acceso a endpoints basandose en el rol persistido en PostgreSQL. Se compone con `FirebaseAuthGuard` para garantizar identidad + permisos.

### Anti-fraude de Votacion

- **Constraint unica**: `@@unique([ideaId, userId])` en `IdeaLike` previene votos duplicados a nivel de base de datos.
- **Transaccion atomica**: `registerLikeAndIncrement` usa `$transaction` de Prisma para crear el registro y incrementar el contador en un solo paso.
- **Deteccion de Prisma P2002**: Si la constraint unica falla, se captura como `ConflictException(409)`.

### Otras Protecciones

- **Helmet**: Cabeceras de seguridad HTTP (X-Frame-Options, CSP, etc.).
- **ThrottlerGuard**: 300 requests por minuto por IP (configurable).
- **CORS estricto**: Solo acepta origenes configurados (localhost, pista8.web.app, pista8.com).
- **ValidationPipe**: Rechaza campos no permitidos (`forbidNonWhitelisted`), transforma tipos automaticamente.
- **Domain Filtering**: Solo emails de dominios institucionales pueden registrarse.

---

## Configuracion y Despliegue

### Prerrequisitos

- Node.js >= 18
- pnpm
- Acceso a Supabase (PostgreSQL) y MongoDB Atlas
- Proyecto de Firebase con Service Account

### Instalacion

```bash
pnpm install
```

### Variables de Entorno

Copiar `.env.example` a `.env` y completar los valores:

```bash
cp .env.example .env
```

| Variable | Descripcion |
|---|---|
| `DATABASE_URL` | URL de Supabase con PgBouncer (puerto 6543) |
| `DIRECT_URL` | URL directa de Supabase (puerto 5432) para migraciones |
| `MONGO_URI` | URI de conexion a MongoDB Atlas |
| `FRONTEND_URL` | URL del frontend (para CORS y WebSocket) |
| `PORT` | Puerto del servidor (default: 3000) |

### Credenciales Firebase

Colocar el archivo `firebase-admin.json` (Service Account) en el directorio raiz del backend. Este archivo esta en `.gitignore`.

### Comandos

```bash
pnpm prisma migrate deploy     # Aplicar migraciones a la BD
pnpm prisma db seed            # Sembrar datos iniciales (roles)
pnpm run start:dev             # Desarrollo con hot-reload
pnpm run build                 # Build de produccion
pnpm run start:prod            # Ejecutar build de produccion
pnpm run test                  # Tests unitarios
pnpm run test:e2e              # Tests end-to-end
pnpm run db:reset              # Reset completo (migrate + seed)
```

Documentacion Swagger disponible en: `http://localhost:3000/docs`

---

## Equipo 15

- Franco Leonel Avaro Oliva
- Guilherme da Silva Santana de Almeida
- Roberto Rodriguez Giorgetti

*Proyecto de Sistemas II - UNIVALLE 2026*
