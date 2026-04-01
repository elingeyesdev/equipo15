# 🚀 Backend - Sistema de Generación de Ideas Potenciales (Pista 8)

Este es el núcleo lógico del proyecto desarrollado por el **Equipo 15** para la asignatura de **Proyecto de Sistemas II**. Está construido con **NestJS** siguiendo una arquitectura modular inspirada en la organización de Laravel.

## 🛠️ Stack Tecnológico
* **Framework:** NestJS
* **Base de Datos:** MongoDB Atlas
* **Autenticación:** Firebase Auth
* **Notificaciones:** Firebase Cloud Messaging (FCM)

## 📁 Estructura de Carpetas (Estilo Laravel)
```text
src/
├── config/          # Configuración de Firebase, MongoDB y variables de entorno.
├── common/          # Guards (Seguridad), Interceptors y filtros de error globales.
├── database/        # Lógica de persistencia de datos.
│   ├── schemas/     # Modelos de Mongoose (Idea, Challenge, User).
│   └── seeders/     # Scripts para cargar datos iniciales de retos.
└── modules/         # Módulos de lógica de negocio (Dominios).
    ├── auth/        # Gestión de sesiones y validación de correo institucional.
    ├── challenges/  # Gestión de retos (Públicos, Privados y QR).
    ├── ideas/       # Postulación y lógica de interacción (Likes/Comentarios).
    └── evaluations/ # Algoritmo Scorecard (Factibilidad, Viabilidad, Deseabilidad).
```

## 🚀 Instalación y Uso

Instalar dependencias: `pnpm install`

Configurar el archivo `.env` con las credenciales de MongoDB y Firebase.

Iniciar en modo desarrollo: `pnpm run start:dev`

## 👥 Equipo de Desarrollo (Equipo 15)
- Franco Leonel Avaro Oliva 
- Guilherme da Silva Santana de Almeida 
- Roberto Rodriguez Giorgetti
