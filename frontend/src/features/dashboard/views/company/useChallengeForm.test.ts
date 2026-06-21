import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useChallengeForm } from './useChallengeForm';

// Hacemos mock de toast para evitar errores en las pruebas
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  }
}));

describe('useChallengeForm - Ficha Técnica Obligatoria (Prueba de Ruta Crítica)', () => {
  it('Debe rechazar la publicación si los campos obligatorios están vacíos', async () => {
    // 1. Arrange: Inicializamos el hook simulando la creación de un nuevo reto
    const mockOnSave = vi.fn();
    const mockOnBack = vi.fn();
    
    const { result } = renderHook(() => 
      useChallengeForm({ onBack: mockOnBack, onSave: mockOnSave })
    );

    // 2. Act: Intentamos guardar con estado 'PUBLISHED' (no como borrador)
    // El formulario por defecto está vacío
    await act(async () => {
      await result.current.handleSave('PUBLISHED');
    });

    // 3. Assert: Verificamos que se hayan generado los errores correspondientes
    // y que onSave NO se haya llamado
    expect(mockOnSave).not.toHaveBeenCalled();
    
    expect(result.current.errors.title).toBe('El título es obligatorio');
    expect(result.current.errors.problemDescription).toBe('La descripción del problema es obligatoria');
    expect(result.current.errors.companyContext).toBe('El contexto de la empresa es obligatorio');
    expect(result.current.errors.participationRules).toBe('Las reglas de participación son obligatorias');
  });
});
