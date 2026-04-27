import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function HasMinimumUniqueWords(
  minUniqueRatio: number = 0.3,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'hasMinimumUniqueWords',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const words = value.toLowerCase().match(/\b[\wáéíóúüñ]+\b/g) || [];
          if (words.length === 0) return true;

          const uniqueWords = new Set(words);
          const ratio = uniqueWords.size / words.length;

          return ratio >= minUniqueRatio;
        },
        defaultMessage(args: ValidationArguments) {
          return 'El texto introducido es demasiado repetitivo ("Spam"). Escriba oraciones humanas coherentes.';
        },
      },
    });
  };
}
