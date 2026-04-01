# 🎨 Frontend - Sistema de Generación de Ideas Potenciales (Pista 8)

Interfaz de usuario interactiva y responsiva construida con **React** y **Vite**. Este módulo se encarga de la visualización dinámica del muro de ideas y la gamificación mediante la animación de **aviones de papel**.

## 🛠️ Stack Tecnológico
* **Framework:** React + TypeScript
* **Herramienta de construcción:** Vite
* **Estilos:** Styled-Components (alineado al Brand Book de Pista 8)
* **Estado Global:** React Context API (`AuthContext`)
* **Enrutamiento:** React Router DOM

## 📁 Estructura de Carpetas (Basada en Arquitectura de Componentes)
```text
src/
├── assets/       # Imágenes, logo de UNIVALLE y el PNG del avión de papel.
├── components/   # Componentes atómicos e interfaces principales.
│   ├── admin/      # Utilidades de uso interno para administradores (ShareChallenge).
│   ├── auth/       # Formulario interactivo, SVG Vectorizado de Google.
│   ├── challenges/ # Gestor de validación visual y proxy de retos privados.
│   ├── dashboard/  # Estructuras maestras del Muro de Ideación y Logout Animado.
│   └── errors/     # Pantallas exclusivas de intercepción e ilusiones 404.
├── config/       # Parámetros y Constantes de inicialización (Firebase y Pista8Theme).
├── context/      # Cerebro Reactivo: Estado global de sesión y protección de rutas.
└── services/     # Clientes de API Axios (`idea.service`, `auth.service`) para handshakes.
```

## 🚀 Instalación y Uso

Instalar dependencias: `pnpm install`

Asegurarse de crear el archivo `.env` transparente a GIT con las variables vitales y seguras del proyecto:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Iniciar servidor de desarrollo: `pnpm run dev` o `pnpm dev`

Abrir en el navegador: `http://localhost:5173`

## 👥 Equipo de Desarrollo (Equipo 15)
- Franco Leonel Avaro Oliva 
- Guilherme da Silva Santana de Almeida 
- Roberto Rodriguez Giorgetti
