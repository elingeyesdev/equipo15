interface MinimalUser {
  nickname?: string;
  displayName?: string;
  email?: string;
  role?: { name: string } | string;
}

export const resolveDisplayName = (user?: MinimalUser | null): string => {
  if (!user) return 'Anónimo';

  if (user.nickname && user.nickname.trim().length > 0) {
    return user.nickname;
  }

  const roleName = typeof user.role === 'string'
    ? user.role
    : user.role?.name?.toLowerCase();

  if (roleName && ['admin', 'company', 'judge'].includes(roleName)) {
    const roleTitles: Record<string, string> = {
      admin: 'Soporte Técnico',
      company: 'Empresa Socia',
      judge: 'Juez Evaluador'
    };

    const prefix = roleTitles[roleName] || 'Gestor';

    if (user.displayName && user.displayName.trim().length > 0) {
      const initials = user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `${prefix} - ${initials}`;
    }
    return prefix;
  }

  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName;
  }

  if (user.email && user.email.trim().length > 0) {
    return user.email.split('@')[0];
  }

  return 'Anónimo';
};
