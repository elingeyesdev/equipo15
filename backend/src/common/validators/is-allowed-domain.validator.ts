import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { WHITELISTED_EMAILS, BLOCKED_EMAIL_DOMAINS, ALLOWED_EMAIL_DOMAINS } from '../constants/email-domains';
import { extractEmailDomain, normalizeEmail } from '../utils/email-domain.util';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsAllowedDomainConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(email: string) {
    if (!email) return false;
    const normalizedEmail = normalizeEmail(email);

    if (
      WHITELISTED_EMAILS.includes(
        normalizedEmail as (typeof WHITELISTED_EMAILS)[number],
      )
    ) {
      return true;
    }

    const domain = extractEmailDomain(normalizedEmail);
    if (!domain) return false;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return true;
    }

    const isBlocked = BLOCKED_EMAIL_DOMAINS.some((b) => domain.endsWith(b.replace('@', '')) || normalizedEmail.endsWith(b));
    if (isBlocked) return false;

    const found = await this.prisma.allowedDomain.findFirst({
      where: { domain, isActive: true },
    });
    if (found) return true;

    const isAllowed = ALLOWED_EMAIL_DOMAINS.some(
      (d) => normalizedEmail.endsWith(d),
    );
    return isAllowed;
  }

  defaultMessage() {
    return 'El correo debe pertenecer a un dominio autorizado.';
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
