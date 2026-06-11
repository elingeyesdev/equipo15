export const DRAFT_TITLE_PLACEHOLDER = 'Borrador sin titulo';
export const DRAFT_PROBLEM_PLACEHOLDER = 'Pendiente de descripcion del problema.';
export const DRAFT_SOLUTION_PLACEHOLDER = 'Pendiente de descripcion de la solucion propuesta.';

export const stripDraftPlaceholder = (value: string, placeholder: string): string => {
  const trimmed = value?.trim() ?? '';
  return trimmed === placeholder ? '' : trimmed;
};

export const stripDraftTitle = (value: string) =>
  stripDraftPlaceholder(value, DRAFT_TITLE_PLACEHOLDER);

export const stripDraftProblem = (value: string) =>
  stripDraftPlaceholder(value, DRAFT_PROBLEM_PLACEHOLDER);

export const stripDraftSolution = (value: string) =>
  stripDraftPlaceholder(value, DRAFT_SOLUTION_PLACEHOLDER);
