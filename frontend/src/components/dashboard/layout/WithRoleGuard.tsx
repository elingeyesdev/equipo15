import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { DashboardSkeleton } from './DashboardSkeleton';

interface WithRoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const WithRoleGuard: React.FC<WithRoleGuardProps> = ({ children, allowedRoles }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!userProfile) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  const userRole = (userProfile.roleInfo?.name || userProfile.role || '').toUpperCase();

  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'ADMIN' || userRole === 'COMPANY') {
      return <Navigate to="/dashboard" replace />;
    }
    if (userRole === 'JUDGE') {
      return <Navigate to="/dashboard/judge/inbox" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
