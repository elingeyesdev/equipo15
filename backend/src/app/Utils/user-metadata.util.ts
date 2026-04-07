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

export function getRoleFromEmail(
  email: string,
): 'admin' | 'company' | 'judge' | 'student' {
  const normalizedEmail = email.toLowerCase();

  if (ADMIN_WHITELIST.includes(normalizedEmail)) return 'admin';
  if (COMPANY_WHITELIST.includes(normalizedEmail)) return 'company';
  if (EXPERT_WHITELIST.includes(normalizedEmail)) return 'judge';

  return 'student';
}
