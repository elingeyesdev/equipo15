import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { DashboardSkeleton } from './DashboardSkeleton';
import { getStoredImpersonationSession } from '../../../utils/impersonation-session';

interface WithRoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const WithRoleGuard: React.FC<WithRoleGuardProps> = ({ children, allowedRoles }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();

  const impersonationSession = getStoredImpersonationSession();

  if (loading) {
    return <DashboardSkeleton />;
  }

  // During impersonation, allow access to company routes while profile is updating
  if (impersonationSession && allowedRoles.includes('COMPANY')) {
    if (!userProfile) {
      return <DashboardSkeleton />;
    }
    // Allow through — the impersonated profile will have COMPANY role once loaded
    const userRole = (userProfile.roleInfo?.name || userProfile.role || '').toUpperCase();
    if (userRole === 'COMPANY' || userRole === 'ADMIN') {
      return <>{children}</>;
    }
  }

  if (!userProfile) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  const userRole = (userProfile.roleInfo?.name || userProfile.role || '').toUpperCase();

  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'ADMIN') {
      return <Navigate to="/dashboard/admin/clients" replace />;
    }
    if (userRole === 'COMPANY') {
      return <Navigate to="/dashboard/company/stats" replace />;
    }
    if (userRole === 'JUDGE') {
      return <Navigate to="/dashboard/judge/inbox" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
