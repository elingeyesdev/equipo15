interface MinimalUser {
  nickname?: string;
  displayName?: string;
  email?: string;
  role?: { name: string } | string;
}

export const resolveDisplayName = (user?: MinimalUser | null): string => {
  if (!user) return 'Anónimo';

  const r = typeof user.role === 'string' ? user.role : user.role?.name;
  const roleLower = (r || '').toLowerCase();

  let nameStr = user.nickname?.trim() || user.displayName?.trim() || user.email?.split('@')[0] || 'Usuario';

  if (roleLower === 'company') return `Empresa Socia - ${nameStr}`;
  if (roleLower === 'admin') return `Soporte Técnico - ${nameStr}`;
  if (roleLower === 'judge') return `Juez Evaluador - ${nameStr}`;
  if (roleLower === 'student') return `Participante - ${nameStr}`;

  return nameStr;
};
