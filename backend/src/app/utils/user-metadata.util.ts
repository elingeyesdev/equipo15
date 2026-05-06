export const ADMIN_WHITELIST = ['admin@univalle.edu'];

export const COMPANY_WHITELIST = ['empresa@univalle.edu'];

export const EXPERT_WHITELIST = [
  'coordinacion@pista8.com',
  'juez.experto@univalle.edu',
];

export const DOMAIN_FACULTY_MAP: Record<string, number> = {
  '@univalle.edu': 1,
  '@pista8.com': 1,
  '@est.univalle.edu': 6,
};

import { UserRole } from '@prisma/client';

export function getRoleFromEmail(
  email: string,
): UserRole {
  const normalizedEmail = email.toLowerCase();

  if (ADMIN_WHITELIST.includes(normalizedEmail)) return UserRole.ADMIN;
  if (COMPANY_WHITELIST.includes(normalizedEmail)) return UserRole.COMPANY;
  if (EXPERT_WHITELIST.includes(normalizedEmail)) return UserRole.JUDGE;

  return UserRole.USER;
}

export function isAuthorizedEmail(email: string): boolean {
  const normalizedEmail = email.toLowerCase();
  const allowedDomains = ['@univalle.edu', '@est.univalle.edu', '@pista8.com', '@gmail.com', '@hotmail.com', '@outlook.com'];
  const allowedEmails = ['elingeyesdev@gmail.com'];

  const hasAllowedDomain = allowedDomains.some((domain) =>
    normalizedEmail.endsWith(domain),
  );
  const isWhitelisted = allowedEmails.includes(normalizedEmail);

  return hasAllowedDomain || isWhitelisted;
}
