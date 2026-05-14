import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  ALLOWED_EMAIL_DOMAINS,
  BLOCKED_EMAIL_DOMAINS,
  WHITELISTED_EMAILS,
} from '../constants/email-domains';

@ValidatorConstraint({ async: false })
export class IsAllowedDomainConstraint implements ValidatorConstraintInterface {
  validate(email: string) {
    if (!email) return false;
    const normalizedEmail = email.toLowerCase();

    if (
      WHITELISTED_EMAILS.includes(
        normalizedEmail as (typeof WHITELISTED_EMAILS)[number],
      )
    ) {
      return true;
    }

    const isAllowed = ALLOWED_EMAIL_DOMAINS.some((domain) =>
      normalizedEmail.endsWith(domain),
    );
    const isBlocked = BLOCKED_EMAIL_DOMAINS.some((domain) =>
      normalizedEmail.endsWith(domain),
    );

    return isAllowed && !isBlocked;
  }

  defaultMessage() {
    return 'El correo debe ser @univalle.edu, @est.univalle.edu o de administración oficial.';
  }
}

export function IsAllowedDomain(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAllowedDomainConstraint,
    });
  };
}
