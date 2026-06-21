import { describe, it, expect } from 'vitest';
import { countWords, getWordRangeError, isWordCountInRange } from './ideaValidation';

describe('ideaValidation - Validación del Límite de Palabras en Ideas (Prueba de Límite)', () => {
  it('Debe contar las palabras correctamente ignorando espacios extra', () => {
    expect(countWords('   Hola   mundo   ')).toBe(2);
    expect(countWords('Una idea innovadora para el reto')).toBe(6);
    expect(countWords('')).toBe(0);
  });

  it('Debe validar correctamente si el texto está dentro del rango permitido', () => {
    // Rango: min 10, max 200
    const textoCorto = 'Muy corto'; // 2 palabras
    const textoValido = 'Esta es una descripción válida que tiene más de diez palabras en total'; // 13 palabras
    
    expect(isWordCountInRange(textoCorto, 10, 200)).toBe(false);
    expect(isWordCountInRange(textoValido, 10, 200)).toBe(true);
  });

  it('Debe generar el mensaje de error exacto cuando se viola el límite', () => {
    const error = getWordRangeError('La solución', 'Texto corto', 10, 200);
    expect(error).toBe('La solución debe tener entre 10 y 200 palabras. Actualmente tiene 2.');
    
    const valido = getWordRangeError('La solución', 'Esta es una idea que cumple con el mínimo de diez palabras', 10, 200);
    expect(valido).toBeUndefined();
  });
});
