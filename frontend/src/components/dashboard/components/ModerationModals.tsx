import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { auth } from '../../../config/firebase';
import { io } from 'socket.io-client';
import { ClockBadgeIcon } from './ClockBadgeIcon';
import { BlockBadgeIcon } from './BlockBadgeIcon';

const AlertIcon = ({ color }: { color: string }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BlockIcon = ({ color }: { color: string }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const Pista8Theme = {
  primary: '#FE410A',
  secondary: '#485054',
  white: '#FFFFFF',
  background: '#F8F9FA',
  error: '#FF3333',
  shadow: 'rgba(72, 80, 84, 0.15)',
};

const pulseRing = keyframes`
  0%   { transform: scale(0.95); opacity: 0.6; }
  50%  { transform: scale(1.08); opacity: 0.2; }
  100% { transform: scale(0.95); opacity: 0.6; }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(8, 10, 12, 0.82);
  backdrop-filter: blur(12px) saturate(0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
`;

const Card = styled(motion.div)<{ $accent: string }>`
  position: relative;
  background: ${Pista8Theme.white};
  border-radius: 20px;
  padding: 40px 32px 32px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 24px 56px ${Pista8Theme.shadow},
    0 8px 16px rgba(0, 0, 0, 0.08);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $accent }) => $accent};
    border-radius: 20px 20px 0 0;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at 50% -20%,
      ${({ $accent }) => $accent}12 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

const IconStack = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  margin-bottom: 4px;
`;

const PulseRing = styled.div<{ $color: string }>`
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: ${({ $color }) => $color}22;
  animation: ${pulseRing} 2.4s ease-in-out infinite;
`;

const IconCircle = styled.div<{ $bg: string; $color: string }>`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  z-index: 1;
`;

const Title = styled.h2`
  margin: 0;
  color: #0f1114;
  font-size: 19px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
  text-align: center;
`;

const Message = styled.p`
  margin: 0;
  color: ${Pista8Theme.secondary};
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  font-family: 'Inter', sans-serif;

  b {
    color: #0f1114;
    font-weight: 600;
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid rgba(72, 80, 84, 0.12);
  margin: 4px 0;
`;

const PrimaryBtn = styled.button<{ $accent: string }>`
  width: 100%;
  padding: 13px 24px;
  border: none;
  border-radius: 10px;
  background: ${({ $accent }) => $accent};
  color: ${Pista8Theme.white};
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 14px ${({ $accent }) => $accent}40;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${({ $accent }) => $accent}55;
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryBtn = styled.button`
  width: 100%;
  padding: 11px 24px;
  border: 1.5px solid rgba(72, 80, 84, 0.2);
  border-radius: 10px;
  background: transparent;
  color: ${Pista8Theme.secondary};
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;

  &:hover {
    background: ${Pista8Theme.background};
    border-color: rgba(72, 80, 84, 0.4);
    color: #0f1114;
  }
`;

const Badge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${({ $color }) => $color}14;
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => $color}30;
  border-radius: 6px;
  padding: 4px 10px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
`;

const WARNING_CONFIG = {
  accent: '#F5A623',
  iconBg: '#FFF8ED',
  iconColor: '#C47D0E',
  badgeColor: '#F5A623',
};

const PENALTY_CONFIG = {
  accent: Pista8Theme.error,
  iconBg: '#FFF0F0',
  iconColor: Pista8Theme.error,
  badgeColor: Pista8Theme.error,
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.88, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 26 } },
  exit:    { opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.18 } },
};

export const ModerationModals = () => {
  const { user, userProfile, setProfile } = useAuth();
  const [warningData, setWarningData] = useState<{ message: string; hours: number } | null>(null);
  const [penaltyData, setPenaltyData] = useState<{ message: string; expiresAt: string } | null>(null);

  useEffect(() => {
    if (userProfile?.status === 'SUSPENDED' && userProfile?.penaltyExpiresAt) {
      setPenaltyData({
        message: 'Tu cuenta sigue suspendida debido a modificaciones masivas.',
        expiresAt: String(userProfile.penaltyExpiresAt),
      });
    }
  }, [userProfile?.status, userProfile?.penaltyExpiresAt]);

  useEffect(() => {
    if (!user || !userProfile?.id) return;
    let active = true;

    const socketURL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:3000';

    user.getIdToken().then(token => {
      if (!active) return;
      const socket = io(socketURL, { reconnection: true, auth: { token } });

      socket.on(`user:soft_block:${userProfile.id}`, (payload: any) => {
        setWarningData(payload);
        setProfile({ ...userProfile, status: 'SOFT_BLOCK' } as any);
      });

      socket.on(`user:suspended:${userProfile.id}`, (payload: any) => {
        setPenaltyData(payload);
        setProfile({ ...userProfile, status: 'SUSPENDED' } as any);
      });

      return () => { socket.disconnect(); };
    });

    return () => { active = false; };
  }, [user, userProfile?.id, setProfile]);

  const handleCloseWarning = () => setWarningData(null);

  const handleClosePenalty = async () => {
    setPenaltyData(null);
    await auth.signOut();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <AnimatePresence>
      {warningData && (
        <Overlay
          key="warning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <Card
            $accent={WARNING_CONFIG.accent}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <IconStack>
              <PulseRing $color={WARNING_CONFIG.iconColor} />
              <IconCircle $bg={WARNING_CONFIG.iconBg} $color={WARNING_CONFIG.iconColor}>
                <AlertIcon color={WARNING_CONFIG.iconColor} />
              </IconCircle>
            </IconStack>

            <Title>¡Vas muy rápido!</Title>

            <Badge $color={WARNING_CONFIG.badgeColor}>
              <ClockBadgeIcon color={WARNING_CONFIG.iconColor} size={12} />
              Bloqueo de {warningData.hours} {warningData.hours === 1 ? 'hora' : 'horas'}
            </Badge>

            <Message>{warningData.message}</Message>

            <Divider />

            <PrimaryBtn $accent={WARNING_CONFIG.accent} onClick={handleCloseWarning}>
              Entendido
            </PrimaryBtn>
          </Card>
        </Overlay>
      )}

      {penaltyData && (
        <Overlay
          key="penalty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <Card
            $accent={PENALTY_CONFIG.accent}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <IconStack>
              <PulseRing $color={PENALTY_CONFIG.iconColor} />
              <IconCircle $bg={PENALTY_CONFIG.iconBg} $color={PENALTY_CONFIG.iconColor}>
                <BlockIcon color={PENALTY_CONFIG.iconColor} />
              </IconCircle>
            </IconStack>

            <Title>Cuenta Suspendida Temporalmente</Title>

            <Badge $color={PENALTY_CONFIG.badgeColor}>
              <BlockBadgeIcon color={PENALTY_CONFIG.iconColor} size={12} />
              Suspensión activa
            </Badge>

            <Message>{penaltyData.message}</Message>

            <Message>
              <b>Reactivación:</b> {formatDate(penaltyData.expiresAt)}
            </Message>

            <Divider />

            <PrimaryBtn $accent={PENALTY_CONFIG.accent} onClick={handleClosePenalty}>
              Cerrar sesión
            </PrimaryBtn>

            <SecondaryBtn onClick={handleClosePenalty}>
              Más información
            </SecondaryBtn>
          </Card>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
