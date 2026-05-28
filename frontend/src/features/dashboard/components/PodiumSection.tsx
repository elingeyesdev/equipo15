import React from 'react';
import styled, { keyframes } from 'styled-components';
import { breakpoints } from '../../../config/theme';
import { premiumTooltip } from '../styles/CommonStyles';

const RANK_COLORS: Record<number, { border: string; bg: string; gradient: string }> = {
  0: {
    border: '#FFD700',
    bg: 'linear-gradient(135deg, #FFFBEA 0%, #FFF9E0 100%)',
    gradient: 'linear-gradient(90deg, #FFD700, #FFE44D, #FFD700)',
  },
  1: {
    border: '#C0C0C0',
    bg: 'linear-gradient(135deg, #F8F9FA 0%, #F1F3F5 100%)',
    gradient: 'linear-gradient(90deg, #C0C0C0, #E0E0E0, #C0C0C0)',
  },
  2: {
    border: '#CD7F32',
    bg: 'linear-gradient(135deg, #FFF5EB 0%, #FFECD2 100%)',
    gradient: 'linear-gradient(90deg, #CD7F32, #E8A860, #CD7F32)',
  },
};

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Grid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: ${p =>
    p.$count === 1 ? '1fr' :
    p.$count === 2 ? '1fr 1fr' :
    'repeat(3, 1fr)'
  };
  gap: 16px;

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr !important;
    gap: 12px;
  }
`;

const Card = styled.div<{ $rank: number; $idx: number }>`
  position: relative;
  padding: 32px 24px 24px;
  border-radius: 20px;
  background: ${p => RANK_COLORS[p.$rank]?.bg ?? 'white'};
  border: 2px solid ${p => RANK_COLORS[p.$rank]?.border ?? 'rgba(72,80,84,0.08)'};
  box-shadow: 0 4px 16px rgba(72,80,84,0.08);
  animation: ${fadeUp} 0.35s ${p => p.$idx * 0.08}s ease both;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(72,80,84,0.18);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 5px;
    background: ${p => RANK_COLORS[p.$rank]?.gradient ?? '#eef0f2'};
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const MedalRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
`;

const RankLabel = styled.span<{ $rank: number }>`
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: ${p => p.$rank === 0 ? '#7a5c00' : p.$rank === 1 ? '#4a4a4a' : '#8a4b08'};
  opacity: 0.8;
`;

const IdeaTitle = styled.h4`
  font-size: 15px;
  font-weight: 800;
  color: #1a1f22;
  margin: 0 0 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
`;

const AvatarFallback = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  color: #4b5563;
  border: 1.5px solid rgba(0,0,0,0.05);
`;

const AuthorName = styled.span`
  font-size: 12.5px;
  font-weight: 700;
  color: #4b5563;
  opacity: 0.85;
`;

const StatChip = styled.div<{ $tooltipText: string }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  background: white;
  border-radius: 100px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
  font-size: 13px;
  font-weight: 900;
  color: #1a1f22;
  cursor: help;
  ${premiumTooltip}
`;

const FireSvg = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fireGradient" x1="12" y1="22" x2="12" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FE410A" />
        <stop offset="0.6" stopColor="#FF8C00" />
        <stop offset="1" stopColor="#FFD700" />
      </linearGradient>
    </defs>
    <path d="M12 2C12 2 12.5 5.5 11 8C9.5 10.5 7 11.5 7 15C7 18.5 9.5 21 12 21C14.5 21 17 18.5 17 15C17 11.5 15.5 8 15.5 8C15.5 8 18 10 19 13C20 16 19 19 19 19C19 19 22 16 21 12C20 8 17.5 5 15.5 3C15.5 3 15 6 13.5 7C12 8 12 2 12 2Z" fill="url(#fireGradient)" />
    <path d="M12 21C11 21 9 20 8 18C7 16 7.5 14 8.5 13C9.5 12 11 12 11 12C11 12 10.5 13.5 11 15C11.5 16.5 13 17 13 17C13 17 12 18 12 21Z" fill="#FFF5EB" fillOpacity="0.6" />
  </svg>
);

const StarSvg = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

interface TopIdea {
  id: string;
  title: string;
  impact: number;
  finalScore?: number;
  likesCount?: number;
  commentsCount?: number;
  author?: {
    name: string;
    nickname?: string;
    avatar?: string;
  };
}

interface PodiumSectionProps {
  topIdeas: TopIdea[];
  onSelectIdea?: (idea: any) => void;
}

const PodiumSection: React.FC<PodiumSectionProps> = ({ topIdeas, onSelectIdea }) => {
  const podiumEntries = topIdeas.slice(0, 3);

  if (podiumEntries.length === 0) {
    return (
      <Grid>
        <Card $rank={1} $idx={0} style={{ gridColumn: '1 / -1', cursor: 'default' }}>
          <IdeaTitle style={{ margin: 0 }}>Aún no hay ideas en vuelo en este reto</IdeaTitle>
        </Card>
      </Grid>
    );
  }

  const getInitials = (name: string): string => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Grid $count={podiumEntries.length}>
      {podiumEntries.map((idea, i) => {
        const isEvaluated = idea.finalScore !== undefined && idea.finalScore > 0;
        const totalInteractions = (idea.likesCount ?? 0) + (idea.commentsCount ?? 0);
        const authorName = (idea as any).authorName || idea.author?.nickname || idea.author?.name || 'Participante';
        const tooltipText = isEvaluated 
          ? `Calificación Final: ${idea.finalScore?.toFixed(1)}` 
          : `Interacciones Totales: ${totalInteractions}`;

        return (
          <Card
            key={idea.id}
            $rank={i}
            $idx={i}
            onClick={() => onSelectIdea?.(idea)}
          >
            <MedalRow>
              {isEvaluated ? <StarSvg size={28} /> : <FireSvg size={28} />}
              <RankLabel $rank={i}>{isEvaluated ? 'Idea Evaluada' : 'Idea On Fire'}</RankLabel>
            </MedalRow>

            <IdeaTitle>{idea.title}</IdeaTitle>

            <AuthorRow>
              <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
              <AuthorName>por {authorName}</AuthorName>
            </AuthorRow>

            <StatChip $tooltipText={tooltipText}>
              {isEvaluated ? (
                <>
                  <StarSvg size={14} />
                  {idea.finalScore?.toFixed(1)}
                </>
              ) : (
                <>
                  <FireSvg size={14} />
                  {totalInteractions}
                </>
              )}
            </StatChip>
          </Card>
        );
      })}
    </Grid>
  );
};

export default PodiumSection;
