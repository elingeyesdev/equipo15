# 🚀 Backend - Sistema de Generación de Ideas Potenciales (Pista 8)

Este es el núcleo lógico del proyecto desarrollado por el **Equipo 15** para la asignatura de **Proyecto de Sistemas II**. Está construido con **NestJS** siguiendo una arquitectura fuertemente orientada a dominio, empleando validación de DTOs y persistencia en MongoDB.

## 🛠️ Stack Tecnológico
* **Framework:** NestJS
* **Base de Datos:** MongoDB Atlas + Mongoose
* **Autenticación:** Firebase Admin Auth (Capa de Sincronización)
* **Tokens e Identificadores:** UUID v4 para generadores criptográficos de enlaces privados.

## 📁 Estructura de Carpetas 
```text
src/
├── app.module.ts    # Orquestador raíz global de la inyección de dependencias.
├── main.ts          # Gateway primario de la aplicación (CORS habilitado, Global Pipes).
├── filters/         # Interceptores (ej. HTTP Exception filters para el UI).
├── validators/      # Guards nativos (Capa de Autenticación protegida FirebaseAuthGuard).
└── modules/         # Módulos de lógica de negocio (Dominios aislados).
    ├── challenges/  
    │   ├── dto/         # Contratos de validación de entradas vía class-validator (CreateChallengeDto).
    │   ├── entities/    # Esquemas, Tracker de Accesos y State Enums Mongoose (DRAFT, ACTIVE).
    │   ├── challenges.controller.ts # Handlers REST (Exposición pública y verificación privada).
    │   └── challenges.service.ts    # Modelado de operaciones Mongoose ($set, Upsert, Busquedas UUID).
    ├── ideas/       # Core de postulación e interacciones asíncronas (Likes/Vistas).
    └── users/       # Capa de Sincronización: Handshake y cacheo dual Mongo/Firebase.
```

## 🚀 Instalación y Uso

Instalar dependencias nativas del sistema usando Node: `pnpm install`

Configurar el archivo `.env` para la `MONGODB_URI` en raíz y subir el archivo identificador `.json` de credenciales maestras pre-generadas en Consola Firebase `firebase-admin.json`.

Correr el compilador (Build-Test): `pnpm build`
Iniciar el Node Server Live Development: `pnpm run start:dev`

## 👥 Equipo de Desarrollo (Equipo 15)
- Franco Leonel Avaro Oliva 
- Guilherme da Silva Santana de Almeida 
- Roberto Rodriguez Giorgetti
