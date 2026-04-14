import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function HasMinimumUniqueWords(minUniqueRatio: number = 0.3, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'hasMinimumUniqueWords',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Dividir por espacios y filtrar vacíos
          const words = value.toLowerCase().match(/\b[\wáéíóúüñ]+\b/g) || [];
          if (words.length === 0) return true; // Si está vacío la validación de IsNotEmpty saltará aparte.

          const uniqueWords = new Set(words);
          const ratio = uniqueWords.size / words.length;

          // Exigimos que al menos el X% de las palabras sean únicas
          return ratio >= minUniqueRatio;
        },
        defaultMessage(args: ValidationArguments) {
          return 'El texto introducido es demasiado repetitivo ("Spam"). Escriba oraciones humanas coherentes.';
        }
      },
    });
  };
}
