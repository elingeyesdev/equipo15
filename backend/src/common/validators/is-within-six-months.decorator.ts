import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsWithinSixMonths(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isWithinSixMonths',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true;

          const constraints = args.constraints as string[];
          const relatedPropertyName = constraints[0];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ] as string | number | Date;

          if (!relatedValue) return true;

          const startDate = new Date(relatedValue);
          const endDate = new Date(value as string | number | Date);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }

          if (endDate < startDate) return false;

          const timeDiff = endDate.getTime() - startDate.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);

          return daysDiff <= 180;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'La fecha de cierre debe ser posterior a la de inicio y no exceder 6 meses (180 días).';
        },
      },
    });
  };
}
