import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { challengeService } from '../../../services/challenge.service';
import { DashboardSkeleton } from './DashboardSkeleton';
import styled, { keyframes } from 'styled-components';

/* ─── Denied state UI ─── */
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const DeniedWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 18px;
  animation: ${pulse} 2s ease infinite;
  text-align: center;
  padding: 40px 20px;
`;

const DeniedIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: rgba(239, 68, 68, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

const DeniedTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #1a1f22;
`;

const DeniedText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  max-width: 380px;
  line-height: 1.6;
`;

interface ChallengeOwnerGuardProps {
  children: React.ReactNode;
}

/**
 * Guard that ensures:
 * 1. User is authenticated
 * 2. User has COMPANY or ADMIN role
 * 3. User owns the challenge (or is ADMIN)
 */
export const ChallengeOwnerGuard: React.FC<ChallengeOwnerGuardProps> = ({ children }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { challengeId } = useParams<{ challengeId: string }>();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [denied, setDenied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const userRole = (userProfile?.roleInfo?.name || userProfile?.role || '').toUpperCase();

  useEffect(() => {
    if (authLoading) return;

    // Not authenticated
    if (!user || !userProfile) {
      setRedirecting(true);
      setChecking(false);
      return;
    }

    // Role check
    if (userRole !== 'COMPANY' && userRole !== 'ADMIN') {
      setDenied(true);
      setChecking(false);
      return;
    }

    // Admin bypasses ownership check
    if (userRole === 'ADMIN') {
      setChecking(false);
      return;
    }

    // Company: verify ownership
    if (!challengeId) {
      setDenied(true);
      setChecking(false);
      return;
    }

    const verifyOwnership = async () => {
      try {
        const response = await challengeService.getChallengeById(challengeId);
        const challenge = response?.data || response;
        const authorId = (challenge as any)?.authorId;

        if (authorId && authorId === userProfile.id) {
          setChecking(false);
        } else {
          setDenied(true);
          setChecking(false);
        }
      } catch {
        setDenied(true);
        setChecking(false);
      }
    };

    void verifyOwnership();
  }, [authLoading, user, userProfile, userRole, challengeId]);

  // Redirect to login
  if (redirecting) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Loading state
  if (authLoading || checking) {
    return <DashboardSkeleton />;
  }

  // Denied: wrong role
  if (denied && (userRole !== 'COMPANY' && userRole !== 'ADMIN')) {
    if (userRole === 'JUDGE') return <Navigate to="/dashboard/judge/inbox" replace />;
    return <Navigate to="/" replace />;
  }

  // Denied: not owner
  if (denied) {
    return (
      <DeniedWrap>
        <DeniedIcon>🔒</DeniedIcon>
        <DeniedTitle>Acceso restringido</DeniedTitle>
        <DeniedText>
          No tienes permisos para acceder al panel de vinculación de este reto.
          Solo el propietario del reto puede gestionarlo.
        </DeniedText>
      </DeniedWrap>
    );
  }

  return <>{children}</>;
};
