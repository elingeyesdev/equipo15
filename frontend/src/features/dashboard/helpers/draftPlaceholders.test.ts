import { describe, it, expect } from 'vitest';
import { 
  DRAFT_TITLE_PLACEHOLDER, 
  DRAFT_PROBLEM_PLACEHOLDER, 
  DRAFT_SOLUTION_PLACEHOLDER,
  stripDraftPlaceholder,
  stripDraftTitle,
  stripDraftProblem,
  stripDraftSolution
} from './draftPlaceholders';

describe('draftPlaceholders - Limpieza de Borradores (Prueba de Estado Limpio)', () => {
  it('Debe devolver string vacío si el texto coincide exactamente con el placeholder', () => {
    expect(stripDraftPlaceholder(DRAFT_TITLE_PLACEHOLDER, DRAFT_TITLE_PLACEHOLDER)).toBe('');
    expect(stripDraftPlaceholder(DRAFT_PROBLEM_PLACEHOLDER, DRAFT_PROBLEM_PLACEHOLDER)).toBe('');
  });

  it('Debe mantener el texto si el usuario ya empezó a escribir algo diferente', () => {
    const textoReal = 'Esta es mi idea genial';
    expect(stripDraftPlaceholder(textoReal, DRAFT_TITLE_PLACEHOLDER)).toBe(textoReal);
  });

  it('Debe limpiar los campos usando los helpers específicos', () => {
    expect(stripDraftTitle(DRAFT_TITLE_PLACEHOLDER)).toBe('');
    expect(stripDraftProblem('Mi problema es la contaminación')).toBe('Mi problema es la contaminación');
    expect(stripDraftSolution(DRAFT_SOLUTION_PLACEHOLDER)).toBe('');
  });
});
