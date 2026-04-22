interface MinimalUser {
  nickname?: string;
  displayName?: string;
  email?: string;
}


export const resolveDisplayName = (user?: MinimalUser | null): string => {
  if (!user) return 'Anónimo';

  if (user.nickname && user.nickname.trim().length > 0) {
    return user.nickname;
  }

  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName;
  }

  if (user.email && user.email.trim().length > 0) {
    return user.email.split('@')[0];
  }

  return 'Anónimo';
};
