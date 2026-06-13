import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Counts the number of real words in a string by splitting on one-or-more
 * whitespace characters and filtering out empty tokens.
 */
function countWords(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * @IsWordCount(min, max)
 *
 * Validates that a string field has between `min` and `max` words (inclusive).
 * Skips validation if the value is empty / undefined (pair with @IsNotEmpty if
 * the field is required, or @IsOptional if it is not).
 */
export function IsWordCount(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isWordCount',
      target: (object as any).constructor,
      propertyName,
      constraints: [min, max],
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (value === undefined || value === null || value === '') return true;
          if (typeof value !== 'string') return false;
          const words = countWords(value);
          return words >= min && words <= max;
        },
        defaultMessage(args: ValidationArguments) {
          const [minW, maxW] = args.constraints as [number, number];
          return `El campo "${args.property}" debe tener entre ${minW} y ${maxW} palabras.`;
        },
      },
    });
  };
}
