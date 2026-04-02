import { memo } from 'react';
import styled, { keyframes } from 'styled-components';

const driftLtr = keyframes`
  from { left: -15%; }
  to   { left: 110%; }
`;

const driftRtl = keyframes`
  from { left: 110%; }
  to   { left: -15%; }
`;

const CloudShape = styled.div<{
  $y: number;
  $scale: number;
  $duration: number;
  $delay: number;
  $rtl: boolean;
}>`
  position: absolute;
  top: ${p => p.$y}px;
  left: ${p => p.$rtl ? '110%' : '-15%'};
  width: ${p => 120 * p.$scale}px;
  height: ${p => 50 * p.$scale}px;
  opacity: 0.55;
  animation: ${p => (p.$rtl ? driftRtl : driftLtr)} ${p => p.$duration}s linear ${p => p.$delay}s infinite;
  animation-fill-mode: none;
`;

const CloudSvg = () => (
  <svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <ellipse cx="60" cy="38" rx="52" ry="14" fill="white" />
    <ellipse cx="42" cy="30" rx="26" ry="18" fill="white" />
    <ellipse cx="72" cy="28" rx="22" ry="16" fill="white" />
    <ellipse cx="90" cy="34" rx="18" ry="12" fill="white" />
  </svg>
);

interface CloudProps {
  y: number;
  scale: number;
  duration: number;
  delay: number;
  rtl: boolean;
}

const Cloud = memo(({ y, scale, duration, delay, rtl }: CloudProps) => (
  <CloudShape $y={y} $scale={scale} $duration={duration} $delay={delay} $rtl={rtl}>
    <CloudSvg />
  </CloudShape>
));

Cloud.displayName = 'Cloud';
export default Cloud;
