import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { userProfile: profile } = useAuth();

  if (!profile) return null;

  const currentRole = profile.roleInfo?.name || profile.role;
  if (currentRole && allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }

  return null;
};
