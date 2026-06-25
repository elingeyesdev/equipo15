import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '@/config/theme';

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Card = styled.div`
  background: ${Pista8Theme.white};
  border-radius: ${Pista8Theme.radius.xl}px;
  box-shadow: ${Pista8Theme.shadowLayers.md};
  padding: ${Pista8Theme.spacing.lg}px ${Pista8Theme.spacing.xl}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: ${Pista8Theme.spacing.md}px;
  transition: box-shadow ${Pista8Theme.transition.normal} ease,
    transform ${Pista8Theme.transition.normal} ease;
  animation: ${fadeUp} 0.4s ease both;

  &:hover {
    box-shadow: ${Pista8Theme.shadowLayers.lg};
    transform: translateY(-2px);
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Pista8Theme.spacing.sm}px;
`;

export const IconWrapper = styled.div<{ $accent?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: ${Pista8Theme.radius.lg}px;
  background: ${({ $accent }) => `${$accent ?? Pista8Theme.primary}15`};
  flex-shrink: 0;
`;

export const DataGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Value = styled.span`
  font-size: 48px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1;
  letter-spacing: -0.02em;
`;

export const Label = styled.span`
  font-size: 18px;
  color: ${Pista8Theme.secondary};
  font-weight: 800;
  text-align: center;
`;

export const Subtitle = styled.span`
  font-size: ${Pista8Theme.fontSize.sm}px;
  color: #6b7280;
  font-weight: 500;
`;
