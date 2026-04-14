import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsWithinSixMonths(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isWithinSixMonths',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Si no hay endDate, no valida esta restricción (ej. Borradores)
          
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          
          if (!relatedValue) return true;

          const startDate = new Date(relatedValue);
          const endDate = new Date(value);

          const timeDiff = endDate.getTime() - startDate.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);

          // Límite de 180 días (aprox 6 meses)
          return daysDiff <= 180;
        },
        defaultMessage(args: ValidationArguments) {
          return 'El Reto no puede tener una duración mayor a 6 meses (180 días) desde su fecha de inicio.';
        }
      },
    });
  };
}
