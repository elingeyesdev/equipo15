import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsAllowedDomainConstraint implements ValidatorConstraintInterface {
  validate(email: string) {
    if (!email) return false;
    
    const blockedDomains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
    const allowedDomains = ['@univalle.edu', '@est.univalle.edu', '@pista8.com'];
    const allowedEmails = ['elingeyesdev@gmail.com'];
    
    if (allowedEmails.includes(email)) return true;
    
    const isAllowed = allowedDomains.some(domain => email.endsWith(domain));
    const isBlocked = blockedDomains.some(domain => email.endsWith(domain));
    
    return isAllowed && !isBlocked;
  }

  defaultMessage() {
    return 'El correo debe ser @univalle.edu, @est.univalle.edu o de administración oficial.';
  }
}

export function IsAllowedDomain(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAllowedDomainConstraint,
    });
  };
}
