# 🎨 Frontend - Sistema de Generación de Ideas Potenciales (Pista 8)

Interfaz de usuario interactiva y responsiva construida con **React** y **Vite**. Este módulo se encarga de la visualización dinámica del muro de ideas y la gamificación mediante la animación de **aviones de papel**.

## 🛠️ Stack Tecnológico
* **Framework:** React + TypeScript
* **Herramienta de construcción:** Vite
* **Estilos:** Tailwind CSS (alineado al Brand Book de Pista 8)
* **Estado Global:** Zustand / Redux (para sincronización de interacciones).

## 📁 Estructura de Carpetas (Basada en Features)
```text
src/
├── assets/       # Imágenes, logo de UNIVALLE y el PNG del avión de papel.
├── components/   # Componentes atómicos globales (Botones, Inputs, Modales).
├── features/     # Lógica dividida por funcionalidad principal.
│   ├── challenges/ # Listado de retos y filtros de búsqueda.
│   ├── ideas/      # Formulario de postulación y animación de aviones.
│   └── evaluations/# Dashboard del Top 10 y visualización de resultados.
├── services/     # Clientes de API (Axios) para comunicación con el backend.
├── store/        # Manejo del estado para likes y comentarios en tiempo real.
└── pages/        # Rutas principales (Home, Admin Dashboard, Vistas de Retos).
```

## 🚀 Instalación y Uso

Instalar dependencias: `pnpm install`

Iniciar servidor de desarrollo: `pnpm run dev`

Abrir en el navegador: `http://localhost:5173`

## 👥 Equipo de Desarrollo (Equipo 15)
- Franco Leonel Avaro Oliva 
- Guilherme da Silva Santana de Almeida 
- Roberto Rodriguez Giorgetti
