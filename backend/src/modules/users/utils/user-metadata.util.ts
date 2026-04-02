export const ADMIN_WHITELIST = [
  'admin@univalle.edu',
  'coordinacion@pista8.com',
  'elingeyesdev@gmail.com'
];

export const EXPERT_WHITELIST = [
  'juez.experto@univalle.edu'
];

export const DOMAIN_FACULTY_MAP: Record<string, number> = {
  '@univalle.edu': 1,
  '@pista8.com': 1,
  '@est.univalle.edu': 6
};

export function getRoleFromEmail(email: string): 'admin' | 'judge' | 'student' {
  const normalizedEmail = email.toLowerCase();
  if (ADMIN_WHITELIST.includes(normalizedEmail)) return 'admin';
  if (EXPERT_WHITELIST.includes(normalizedEmail)) return 'judge';
  return 'student';
}
