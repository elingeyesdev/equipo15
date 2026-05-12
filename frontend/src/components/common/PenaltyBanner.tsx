import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Banner = styled.div`
  background: #fff5f5;
  border-bottom: 1px solid #feb2b2;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  animation: ${slideDown} 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  position: sticky;
  top: 0;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e53e3e;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.15);
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  font-size: 14px;
  font-weight: 800;
  color: #c53030;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const Description = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #e53e3e;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(229, 62, 62, 0.1);
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
  width: 100%;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: linear-gradient(90deg, #f56565, #e53e3e);
  transition: width 1s linear;
`;

const Timer = styled.div`
  display: flex;
  gap: 12px;
  background: white;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #feb2b2;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
`;

const TimePart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 32px;
`;

const TimeValue = styled.span`
  font-size: 18px;
  font-weight: 900;
  color: #c53030;
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const TimeLabel = styled.span`
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  color: #e53e3e;
  opacity: 0.6;
  margin-top: 2px;
`;

const PenaltyBanner: React.FC = () => {
  const { userProfile: profile, refetchProfile } = useAuth();
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00', total: 0 });
  const [progressPct, setProgressPct] = useState(0);

  const isPenalized = !!profile?.penaltyExpiresAt && new Date(profile.penaltyExpiresAt).getTime() > Date.now();

  const calculateTimeLeft = useCallback(() => {
    if (!profile?.penaltyExpiresAt) return { h: '00', m: '00', s: '00', total: 0 };
    const expiry = new Date(profile.penaltyExpiresAt).getTime();
    const now = Date.now();
    const diff = expiry - now;

    if (diff <= 0) return { h: '00', m: '00', s: '00', total: 0 };

    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

    return { h, m, s, total: diff };
  }, [profile?.penaltyExpiresAt]);

  const calculateProgress = useCallback(() => {
    if (!profile?.penaltyExpiresAt) return 0;
    const expiry = new Date(profile.penaltyExpiresAt).getTime();
    const now = Date.now();
    
    const TOTAL_DURATION = 24 * 60 * 60 * 1000; // 24h por defecto
    const diff = expiry - now;
    
    if (diff <= 0) return 100;
    return Math.max(0, Math.min(100, ((TOTAL_DURATION - diff) / TOTAL_DURATION) * 100));
  }, [profile?.penaltyExpiresAt]);

  useEffect(() => {
    if (!isPenalized) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      setProgressPct(calculateProgress());

      if (remaining.total <= 0) {
        clearInterval(timer);
        refetchProfile();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPenalized, calculateTimeLeft, calculateProgress, refetchProfile]);

  if (!isPenalized || timeLeft.total <= 0) return null;

  return (
    <Banner>
      <IconBox>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </IconBox>

      <Content>
        <Title>Cuenta en modo solo lectura</Title>
        <Description>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Tu acceso completo se restaurará en:
        </Description>
        <ProgressBar>
          <ProgressFill $pct={progressPct} />
        </ProgressBar>
      </Content>

      <Timer>
        <TimePart>
          <TimeValue>{timeLeft.h}</TimeValue>
          <TimeLabel>Hrs</TimeLabel>
        </TimePart>
        <TimeValue style={{ fontSize: 14, opacity: 0.3, marginTop: 2 }}>:</TimeValue>
        <TimePart>
          <TimeValue>{timeLeft.m}</TimeValue>
          <TimeLabel>Min</TimeLabel>
        </TimePart>
        <TimeValue style={{ fontSize: 14, opacity: 0.3, marginTop: 2 }}>:</TimeValue>
        <TimePart>
          <TimeValue>{timeLeft.s}</TimeValue>
          <TimeLabel>Seg</TimeLabel>
        </TimePart>
      </Timer>
    </Banner>
  );
};

export default PenaltyBanner;
