import { memo, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { computeSize, computeXPosition, computeScale, computeFloatDuration } from './flight.engine';
import type { PlaneIdea, WallPhase } from './types';
import planeImg from '../../assets/logo_avion.png';

const float = keyframes`
  0%   { transform: translateY(0px) rotate(-2deg); }
  50%  { transform: translateY(-10px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(-2deg); }
`;

const raceFly = keyframes`
  from { left: var(--plane-x); }
  to   { left: calc(100% + 200px); }
`;

const PlaneWrapper = styled.div<{
  $x: number;
  $y: number;
  $size: number;
  $floatDuration: number;
  $delay: number;
  $scale: number;
  $zIndex: number;
  $isRacing: boolean;
}>`
  position: absolute;
  top: ${p => p.$y - p.$size / 2 + 16}px;
  left: ${p => p.$x + 20}px;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  --plane-x: ${p => p.$x + 20}px;
  transform: scale(${p => p.$scale});
  transform-origin: center center;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
              width 0.6s ease-out,
              height 0.6s ease-out;
  animation: ${p =>
    p.$isRacing
      ? css`${raceFly} 2.2s cubic-bezier(0.4, 0, 1, 1) forwards`
      : css`${float} ${p.$floatDuration}s ease-in-out ${p.$delay}s infinite`};
  z-index: ${p => p.$zIndex};
  cursor: ${p => p.onClick ? 'pointer' : 'default'};
  user-select: none;
  will-change: transform;
  
  &:hover {
    transform: scale(${p => p.$scale * 1.05});
  }
`;

const AvatarLabel = styled.div<{ $size: number }>`
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  font-size: ${p => Math.max(9, p.$size * 0.16)}px;
  font-weight: 700;
  color: #1a4a6b;
  white-space: nowrap;
  background: rgba(255,255,255,0.75);
  padding: 2px 6px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  pointer-events: none;
`;

const flyIn = keyframes`
  0% { opacity: 0; transform: translateX(-50px) scale(0.9); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
`;

const PlaneImage = styled.img<{ $hueRotate: number }>`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 6px 10px rgba(255, 64, 0, 0.24)) ${p => p.$hueRotate ? `hue-rotate(${p.$hueRotate}deg)` : ''};
  animation: ${flyIn} 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
`;

interface PlaneProps {
  idea: PlaneIdea;
  canvasWidth: number;
  phase: WallPhase;
  challengeFacultyId?: number;
  onClick?: () => void;
}

const FACULTY_HUE_MAP: Record<number, number> = {
  1: 180,
  2: 300,
  3: 150,
  4: 90,
  5: 240,
  6: 45,
};

const BASE_Z_INDEX = 10;

const Plane = memo(
  ({ idea, canvasWidth, phase, challengeFacultyId, onClick }: PlaneProps) => {
    const size = useMemo(() => computeSize(idea.likesCount), [idea.likesCount]);
    const scale = useMemo(() => computeScale(idea.likesCount), [idea.likesCount]);
    const floatDuration = useMemo(() => computeFloatDuration(idea.likesCount), [idea.likesCount]);
    const x = useMemo(
      () => {
        const base = computeXPosition(idea.commentsCount, canvasWidth);
        return Math.max(0, Math.min(canvasWidth - size, base));
      },
      [idea.commentsCount, canvasWidth, size],
    );
    const isRacing = phase === 'race';
    const zIndex = BASE_Z_INDEX + idea.likesCount;

    const hueRotate = (!challengeFacultyId && idea.authorFacultyId) 
      ? (FACULTY_HUE_MAP[idea.authorFacultyId] || 0) 
      : 0;

    return (
      <PlaneWrapper
        $x={x}
        $y={idea.laneY}
        $size={size}
        $floatDuration={floatDuration}
        $delay={idea.floatDelay}
        $scale={scale}
        $zIndex={zIndex}
        $isRacing={isRacing}
        onClick={onClick}
      >
        <PlaneImage src={planeImg} alt={idea.title} $hueRotate={hueRotate} />
        <AvatarLabel $size={size}>{idea.title.slice(0, 24)}</AvatarLabel>
      </PlaneWrapper>
    );
  },
  (prev, next) =>
    prev.idea.laneY === next.idea.laneY &&
    prev.idea.likesCount === next.idea.likesCount &&
    prev.idea.commentsCount === next.idea.commentsCount &&
    prev.phase === next.phase &&
    prev.canvasWidth === next.canvasWidth,
);

Plane.displayName = 'Plane';
export default Plane;
