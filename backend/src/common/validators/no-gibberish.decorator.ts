import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const VOWELS = new Set('aeiouáéíóúüAEIOUÁÉÍÓÚÜ');

/**
 * Detecta texto "gibberish" (sin sentido) revisando la relación de vocales
 * por palabra. Una palabra se considera gibberish si tiene menos del 25% de
 * vocales. Si más del 25% de las palabras calificadas son gibberish → rechazo.
 *
 * Se ignoran palabras de 1–2 caracteres y tokens que sean solo dígitos.
 */
function isGibberish(text: string, gibberishWordThreshold = 0.25, minVowelRatio = 0.25): boolean {
  const words = text.match(/[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{3,}/g) || [];
  if (words.length === 0) return false;

  let gibberishCount = 0;

  for (const word of words) {
    const vowelCount = [...word].filter(ch => VOWELS.has(ch)).length;
    if (vowelCount / word.length < minVowelRatio) {
      gibberishCount++;
    }
  }

  return gibberishCount / words.length > gibberishWordThreshold;
}

export function NoGibberish(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'noGibberish',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string' || value.trim().length === 0) return true;
          return !isGibberish(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return 'El texto parece no tener sentido. Escribe una descripción coherente.';
        },
      },
    });
  };
}
