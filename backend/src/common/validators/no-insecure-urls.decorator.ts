import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function NoInsecureUrls(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'noInsecureUrls',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;

          const insecureUrlRegex = /http:\/\/[^\s]+/i;
          if (insecureUrlRegex.test(value)) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'No se permiten enlaces inseguros. Utiliza únicamente enlaces HTTPS en tu contenido.';
        },
      },
    });
  };
}
