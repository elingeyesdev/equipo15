import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Rechaza el texto si más del X% son caracteres no-alfabéticos
 * (números, símbolos como !@#$%^&*, etc.).
 * Puntuación básica (.,;:¿?¡!()- ) se permite y no cuenta como "símbolo raro".
 */
export function NoExcessiveSymbols(maxRatio: number = 0.3, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'noExcessiveSymbols',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxRatio],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string' || value.length === 0) return true;

          // Caracteres "válidos": letras (con acentos), espacios y puntuación básica
          const cleanChars = value.match(/[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s.,;:¿?¡!()\-"']/g) || [];
          const ratio = cleanChars.length / value.length;

          // Si menos del (1 - maxRatio) del texto es "limpio", es spam
          return ratio >= (1 - maxRatio);
        },
        defaultMessage(args: ValidationArguments) {
          return 'El texto contiene demasiados símbolos o caracteres especiales. Escribe oraciones descriptivas.';
        },
      },
    });
  };
}
