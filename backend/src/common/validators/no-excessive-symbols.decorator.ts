import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';


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
