export const DOMAIN_FACULTY_MAP: Record<string, number> = {
  '@univalle.edu': 1,
  '@pista8.com': 1,
  '@est.univalle.edu': 6,
};

import { UserRole } from '@prisma/client';
import {
  ALLOWED_EMAIL_DOMAINS,
  WHITELISTED_EMAILS,
} from '../../../common/constants/email-domains';

export const ADMIN_WHITELIST = ['admin@pista8ideacion.com'];

export const COMPANY_WHITELIST: string[] = [];

export const EXPERT_WHITELIST: string[] = [];

export function getRoleFromEmail(email: string): UserRole {
  const normalizedEmail = email.toLowerCase();

  if (ADMIN_WHITELIST.includes(normalizedEmail)) return UserRole.ADMIN;
  if (COMPANY_WHITELIST.includes(normalizedEmail)) return UserRole.ORGANIZATION;
  if (EXPERT_WHITELIST.includes(normalizedEmail)) return UserRole.JUDGE;

  return UserRole.USER;
}

export function isAuthorizedEmail(email: string): boolean {
  const normalizedEmail = email.toLowerCase();

  if (
    WHITELISTED_EMAILS.includes(
      normalizedEmail as (typeof WHITELISTED_EMAILS)[number],
    )
  ) {
    return true;
  }

  return ALLOWED_EMAIL_DOMAINS.some((domain) =>
    normalizedEmail.endsWith(domain),
  );
}
