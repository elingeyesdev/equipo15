import { memo, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { computeSize, computeXPosition, computeScale, computeFloatDuration } from './flight.engine';
import { Pista8Theme } from '../../config/theme';
import { FACULTIES } from '../../config/faculties';
import type { PlaneIdea, WallPhase } from './types';
import { Flame, Star } from 'lucide-react';
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

const auraBreath = keyframes`
  0%   { transform: scale(1);   opacity: 0.55; }
  50%  { transform: scale(1.18); opacity: 0.85; }
  100% { transform: scale(1);   opacity: 0.55; }
`;

const ringSpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

const highlightPulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.4); }
  50%  { box-shadow: 0 0 0 18px rgba(255, 215, 0, 0), 0 0 35px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.4); }
`;

const badgePop = keyframes`
  0%   { transform: translateX(-50%) scale(0); opacity: 0; }
  60%  { transform: translateX(-50%) scale(1.15); opacity: 1; }
  100% { transform: translateX(-50%) scale(1);   opacity: 1; }
`;

const highlightWinnerAnim = keyframes`
  0%   { filter: drop-shadow(0 0 0px rgba(254, 65, 10, 0)); transform: scale(1); }
  50%  { filter: drop-shadow(0 0 25px rgba(254, 65, 10, 0.9)); transform: scale(1.15); }
  100% { filter: drop-shadow(0 0 0px rgba(254, 65, 10, 0)); transform: scale(1); }
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
  $glowIntensity: number;
  $dimmed: boolean;
  $isHighlighted: boolean;
}>`
  position: absolute;
  top: ${p => p.$y - p.$size / 2 + 16}px;
  left: ${p => p.$x + 20}px;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  --plane-x: ${p => p.$x + 20}px;
  transform: scale(${p => p.$scale});
  transform-origin: center center;
  transition: top 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.6s ease-out,
              filter 0.6s ease-out,
              transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
              width 0.6s ease-out,
              height 0.6s ease-out;
  animation: ${p =>
    p.$isRacing
      ? css`${raceFly} 2.2s cubic-bezier(0.4, 0, 1, 1) forwards`
      : css`${float} ${p.$floatDuration}s ease-in-out ${p.$delay}s infinite`};
  z-index: ${p => p.$zIndex};
  cursor: ${p => p.onClick ? 'pointer' : 'default'};
  user-select: none;
  will-change: top, transform, opacity;
  opacity: ${p => p.$dimmed ? 0.4 : 1};
  filter: ${p => p.$dimmed ? 'grayscale(0.4)' : 'none'};

  ${p => p.$glowIntensity > 0 && css`
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 160%;
      height: 160%;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(254, 65, 10, 0.30) 0%,
        rgba(255, 140, 50, 0.12) 45%,
        transparent 70%
      );
      opacity: ${p.$glowIntensity};
      transform: translate(-50%, -50%);
      animation: ${auraBreath} 2.6s ease-in-out infinite;
      pointer-events: none;
      z-index: -1;
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 130%;
      height: 130%;
      border-radius: 50%;
      border: 2px solid transparent;
      border-top-color: rgba(254, 65, 10, ${0.45 * p.$glowIntensity});
      border-right-color: rgba(255, 160, 60, ${0.25 * p.$glowIntensity});
      opacity: ${p.$glowIntensity};
      animation: ${ringSpin} 3s linear infinite;
      pointer-events: none;
      z-index: -1;
    }
  `}

  ${p => p.$isHighlighted && css`
    z-index: 9999 !important;
    border-radius: 50%;
    animation: ${float} ${p.$floatDuration}s ease-in-out ${p.$delay}s infinite,
               ${highlightPulse} 1.8s ease-in-out infinite !important;
    transform: scale(${p.$scale * 1.2}) !important;
    filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8)) brightness(1.1) !important;
    opacity: 1 !important;
  `}

  &:hover {
    transform: scale(${p => p.$scale * 1.05});
  }

  &.highlight-winner {
    animation: ${highlightWinnerAnim} 2.5s ease-in-out;
    z-index: 9999 !important;
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
  text-align: center;
`;

const DateLabel = styled.div<{ $size: number }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  font-size: ${p => Math.max(8, p.$size * 0.13)}px;
  font-weight: 600;
  color: rgba(26, 74, 107, 0.65);
  white-space: nowrap;
  background: rgba(255,255,255,0.65);
  padding: 1px 5px;
  border-radius: 5px;
  backdrop-filter: blur(4px);
  pointer-events: none;
`;

const FireBadge = styled.div<{ $size: number }>`
  position: absolute;
  top: calc(100% + 22px);
  left: 50%;
  transform: translateX(-50%);
  font-size: ${p => Math.max(9, p.$size * 0.14)}px;
  font-weight: 800;
  color: #ef4444;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 6px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
`;

const StarBadge = styled.div<{ $size: number }>`
  position: absolute;
  top: calc(100% + 22px);
  left: 50%;
  transform: translateX(-50%);
  font-size: ${p => Math.max(10, p.$size * 0.15)}px;
  font-weight: 900;
  color: #FF8C00;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.95);
  padding: 3px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  border: 1px solid rgba(255, 140, 0, 0.2);
`;

const NewBadge = styled.span<{ $intensity: number }>`
  position: absolute;
  top: calc(100% + 20px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: ${Pista8Theme.white};
  background: linear-gradient(135deg, ${Pista8Theme.primary}, #ff7b00);
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(254, 65, 10, 0.35);
  opacity: ${p => Math.min(1, p.$intensity + 0.2)};
  animation: ${badgePop} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
`;

const flyIn = keyframes`
  0% { opacity: 0; transform: translateX(-50px) scale(0.9); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
`;

const PlaneImage = styled.img<{ $filter?: string }>`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18)) ${p => p.$filter || ''};
  animation: ${flyIn} 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
`;

interface PlaneProps {
  idea: PlaneIdea;
  canvasWidth: number;
  phase: WallPhase;
  challengeFacultyId?: number | string | null;
  glowIntensity?: number;
  dimmed?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const formatRelativeDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
};

const FACULTY_FILTER_MAP: Record<string, string> = {
  ingenieria: 'sepia(1) hue-rotate(190deg) saturate(4) brightness(0.7)',
  'ciencias y tecnologia': 'sepia(1) hue-rotate(155deg) saturate(4) brightness(0.75)',
  ciencias: 'sepia(1) hue-rotate(155deg) saturate(4) brightness(0.75)',
  humanidades: 'sepia(1) hue-rotate(5deg) saturate(3) brightness(0.9)',
  medicina: 'sepia(1) hue-rotate(120deg) saturate(4) brightness(0.65)',
  derecho: 'sepia(1) hue-rotate(325deg) saturate(4) brightness(0.65)',
  arquitectura: 'sepia(1) hue-rotate(190deg) saturate(0.3) brightness(0.65)',
  gastronomia: 'sepia(1) hue-rotate(10deg) saturate(3) brightness(0.85)',
};

const normalizeFacultyKey = (facultyName?: string) => {
  if (!facultyName) return undefined;
  return facultyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^facultad de\s+/, '')
    .trim();
};

const getFacultyFilter = (facultyId?: number | string, facultyName?: string): string | undefined => {
  const normalizedName = normalizeFacultyKey(facultyName);
  if (normalizedName && FACULTY_FILTER_MAP[normalizedName]) {
    return FACULTY_FILTER_MAP[normalizedName];
  }

  if (facultyId === null || facultyId === undefined) return undefined;
  const numericId = typeof facultyId === 'number' ? facultyId : Number(facultyId);
  if (Number.isNaN(numericId)) return undefined;

  const canonicalFacultyName = FACULTIES.find((faculty) => faculty.id === numericId)?.name;
  return FACULTY_FILTER_MAP[normalizeFacultyKey(canonicalFacultyName) ?? ''];
};

const BASE_Z_INDEX = 10;

const Plane = memo(
  ({ idea, canvasWidth, phase, glowIntensity = 0, dimmed = false, isHighlighted = false, onClick }: PlaneProps) => {
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

    const facultyFilter = getFacultyFilter(idea.authorFacultyId, idea.authorFacultyName);
    const showFinalScore = idea.challengeStatus === 'CLOSED';
    const hasBadge = showFinalScore ? (idea.finalScore ?? 0) > 0 : (idea.fireScore ?? 0) > 0;

    return (
      <PlaneWrapper
        id={`idea-${idea.id}`}
        $x={x}
        $y={idea.laneY}
        $size={size}
        $floatDuration={floatDuration}
        $delay={idea.floatDelay}
        $scale={scale}
        $zIndex={zIndex}
        $isRacing={isRacing}
        $glowIntensity={glowIntensity}
        $dimmed={dimmed}
        $isHighlighted={isHighlighted}
        onClick={onClick}
      >
        <PlaneImage src={planeImg} alt={idea.title} $filter={facultyFilter} />
        <AvatarLabel $size={size}>{idea.title.slice(0, 24)}</AvatarLabel>
        {idea.createdAt && (
          <DateLabel $size={size}>{formatRelativeDate(idea.createdAt)}</DateLabel>
        )}
        {showFinalScore && (idea.finalScore ?? 0) > 0 ? (
          <StarBadge $size={size}>
            <Star size={Math.max(12, size * 0.18)} fill="#FF8C00" stroke="#FF8C00" />
            {idea.finalScore?.toFixed(2)}
          </StarBadge>
        ) : (idea.fireScore ?? 0) > 0 ? (
          <FireBadge $size={size}>
            <Flame size={Math.max(12, size * 0.18)} fill="#ef4444" stroke="#ef4444" />
            {idea.fireScore}
          </FireBadge>
        ) : null}
        {glowIntensity > 0 && <NewBadge $intensity={glowIntensity} style={{ top: hasBadge ? 'calc(100% + 48px)' : 'calc(100% + 20px)' }}>NUEVA</NewBadge>}
        {isHighlighted && <NewBadge $intensity={1} style={{ top: hasBadge ? 'calc(100% + 48px)' : 'calc(100% + 20px)' }}>✦ SELECCIONADA</NewBadge>}
      </PlaneWrapper>
    );
  },
  (prev, next) =>
    prev.idea.laneY === next.idea.laneY &&
    prev.idea.likesCount === next.idea.likesCount &&
    prev.idea.commentsCount === next.idea.commentsCount &&
    prev.phase === next.phase &&
    prev.canvasWidth === next.canvasWidth &&
    prev.glowIntensity === next.glowIntensity &&
    prev.dimmed === next.dimmed &&
    prev.isHighlighted === next.isHighlighted,
);

Plane.displayName = 'Plane';
export default Plane;
