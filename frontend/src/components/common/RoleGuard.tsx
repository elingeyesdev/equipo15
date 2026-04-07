import type { ReactNode } from 'react';
import { useUser } from '../../context/UserContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { profile } = useUser();

  if (!profile) return null;

  const currentRole = profile.roleInfo?.name || profile.role;
  if (currentRole && allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }

  return null;
};
