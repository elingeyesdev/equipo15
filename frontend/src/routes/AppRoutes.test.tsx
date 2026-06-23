import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppRoutes from './AppRoutes';
import { useAuth } from '../context/AuthContext';

// Mock de useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AppRoutes - Seguridad en Rutas de Roles (Prueba de Ruta Crítica)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe bloquear a un alumno que intenta acceder a una ruta de administrador o empresa y redirigirlo al inicio', () => {
    // 1. Arrange: Simulamos a un estudiante logueado
    (useAuth as any).mockReturnValue({
      user: { uid: 'student-123', getIdToken: vi.fn().mockResolvedValue('token') },
      userProfile: { roleInfo: { name: 'student' } },
      loading: false,
    });

    // 2. Act: Renderizamos la aplicación intentando acceder a /dashboard/company
    render(
      <MemoryRouter initialEntries={['/dashboard/company/create-challenge']}>
        <AppRoutes />
        {/* Ruta para comprobar a dónde nos redirigió */}
        <Routes>
          <Route path="/dashboard" element={<div data-testid="student-dashboard">Dashboard Alumno</div>} />
        </Routes>
      </MemoryRouter>
    );

    // 3. Assert: Esperamos que el sistema intercepte la ruta y redirija al /dashboard del alumno
    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
  });
});
