import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChallengeJudgeSelector } from './ChallengeJudgeSelector';
import axiosInstance from '../../../../../api/axiosConfig';

// Mockeamos axios
vi.mock('../../../../../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

// Mockeamos sonner para los toasts
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

import { toast } from 'sonner';

describe('ChallengeJudgeSelector - Buscador Universal de Jueces (Prueba de Límite Máximo)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe impedir que se seleccionen más de 5 jueces', async () => {
    // 1. Arrange: Simulamos que el backend nos devuelve 6 jueces
    const mockJudges = Array.from({ length: 6 }, (_, i) => ({
      id: `judge-${i}`,
      displayName: `Juez ${i}`,
      email: `juez${i}@test.com`,
      avatarUrl: null
    }));

    (axiosInstance.get as any).mockResolvedValueOnce({ data: { data: mockJudges } }); // /search
    (axiosInstance.get as any).mockResolvedValueOnce({ data: { data: [] } }); // /assigned

    render(<ChallengeJudgeSelector challengeId="test-challenge" />);

    // Esperamos a que la lista se cargue
    await waitFor(() => {
      expect(screen.getByText('Juez 0')).toBeInTheDocument();
    });

    // 2. Act: Seleccionamos los primeros 5 jueces
    const judgeRows = screen.getAllByText(/Juez /);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(judgeRows[i]);
    }

    // Comprobamos que el contador llegó al límite
    expect(screen.getByText('5 / 5 jueces seleccionados')).toBeInTheDocument();

    // Intentamos seleccionar al juez número 6
    fireEvent.click(judgeRows[5]);

    // 3. Assert: El sistema debe deshabilitar las demás filas y no permitir la selección
    // El contador debe seguir en 5
    expect(screen.getByText('5 / 5 jueces seleccionados')).toBeInTheDocument();
  });
});
