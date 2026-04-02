import type { ReactNode } from 'react';
import { useUser } from '../../context/UserContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { profile } = useUser();

  if (!profile || !profile.roleId) return null;

  if (allowedRoles.includes(profile.roleId.name)) {
    return <>{children}</>;
  }

  return null;
};
