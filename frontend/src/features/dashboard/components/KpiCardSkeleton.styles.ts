import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '@/config/theme';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const PulseBase = styled.div`
  border-radius: ${Pista8Theme.radius.md}px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

export const CirclePulse = styled(PulseBase)`
  width: 44px;
  height: 44px;
  border-radius: ${Pista8Theme.radius.lg}px;
`;

export const BarPulse = styled(PulseBase)<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width ?? '100px'};
  height: ${({ $height }) => $height ?? '16px'};
`;
