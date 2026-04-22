import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';


export function NoNumbers(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'noNumbers',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string' || value.length === 0) return true;
          return !/\d/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Este campo no permite números. Utiliza únicamente texto descriptivo.';
        },
      },
    });
  };
}
