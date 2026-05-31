import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare } from 'lucide-react';
import IdeationGuidePanel from './IdeationGuidePanel';
import { Pista8Theme, breakpoints } from '../../../config/theme';
import { interactiveHover, premiumTooltip } from '../styles/CommonStyles';
import type { RawIdea, PlaneIdea, SortMode } from '../../../features/sky-wall/types';
import { resolveDisplayName } from '../../../utils/user.utils';
import { useAuth } from '../../../context/AuthContext';
import { useWallEventListener } from '../../../hooks/useWallEvents';
import { commentService } from '../../../services/comment.service';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Wrapper = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.35s ease both;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const ViewAllBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 9px 16px;
  border-radius: 999px;
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 8px 22px ${Pista8Theme.primary}30;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px ${Pista8Theme.primary}42;
  }

  svg { width: 12px; height: 12px; stroke-width: 3; }
`;

const TopGrid = styled.div<{ $count: number; $isVertical?: boolean }>`
  display: grid;
  grid-template-columns: ${p => p.$count === 1 ? '1fr' : `repeat(${Math.min(p.$count, 3)}, 1fr)`};
  gap: 14px;
  margin-bottom: 16px;

  ${p => p.$isVertical && `
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-bottom: 0;
  `}

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
    ${p => p.$isVertical && `
      display: grid;
      grid-template-columns: 1fr;
      flex: none;
    `}
  }
`;

const medalStyles: Record<number, { border: string; bg: string; gradient: string; badge: string; badgeText: string; label: string }> = {
  0: {
    border: '#FFD700',
    bg: 'linear-gradient(135deg, #FFFBEA 0%, #FFF9E0 100%)',
    gradient: 'linear-gradient(90deg, #FFD700, #FFE44D, #FFD700)',
    badge: '#FFD700',
    badgeText: '#7a5c00',
    label: '1°',
  },
  1: {
    border: '#C0C0C0',
    bg: 'linear-gradient(135deg, #F8F9FA 0%, #F1F3F5 100%)',
    gradient: 'linear-gradient(90deg, #C0C0C0, #E0E0E0, #C0C0C0)',
    badge: '#C0C0C0',
    badgeText: '#4a4a4a',
    label: '2°',
  },
  2: {
    border: '#CD7F32',
    bg: 'linear-gradient(135deg, #FFF5EB 0%, #FFECD2 100%)',
    gradient: 'linear-gradient(90deg, #CD7F32, #E8A860, #CD7F32)',
    badge: '#CD7F32',
    badgeText: '#fff',
    label: '3°',
  },
};

const TopCard = styled.div<{ $rank: number; $idx: number; $isVertical?: boolean }>`
  position: relative;
  padding: 48px 18px 16px;
  border-radius: 18px;
  background: ${p => medalStyles[p.$rank]?.bg ?? 'white'};
  border: 2px solid ${p => medalStyles[p.$rank]?.border ?? 'rgba(72,80,84,0.08)'};
  box-shadow: 0 4px 16px rgba(72,80,84,0.08);
  animation: ${fadeIn} 0.35s ${p => p.$idx * 0.08}s ease both;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  ${p => p.$isVertical && `
    flex: 1;
    min-height: 0;
    padding: 32px 18px 16px;
  `}

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(72,80,84,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: ${p => medalStyles[p.$rank]?.gradient ?? '#eef0f2'};
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const MedalBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  background: ${p => medalStyles[p.$rank]?.badge ?? '#f1f3f5'};
  color: ${p => medalStyles[p.$rank]?.badgeText ?? '#9ca3af'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

const CardTitle = styled.p`
  font-size: 14px;
  font-weight: 800;
  color: #1a1f22;
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardAuthor = styled.p`
  font-size: 12.5px;
  font-weight: 700;
  color: #4b5563;
  margin: 0 0 10px;
  opacity: 0.9;
`;

const CardStats = styled.div<{ $isVertical?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: ${p => p.$isVertical ? '14px' : 'auto'};
`;

const StatItem = styled.div<{ $tooltipText: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  
  ${interactiveHover}
  ${premiumTooltip}

  svg { 
    opacity: 0.8;
  }
`;

const StatValue = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: #4b5563;
`;

const DateLabel = styled.span`
  position: absolute;
  bottom: 16px;
  right: 18px;
  font-size: 10px;
  font-weight: 500;
  color: #c0c8d0;
`;

const ExpandedGrid = styled(motion.div)`
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 16px;
  animation: ${fadeIn} 0.35s ease both;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.15);
    border-radius: 4px;
  }
`;

const ExpandedCard = styled(motion.div)<{ $rank: number; $idx: number }>`
  position: relative;
  flex: 0 0 auto;
  width: 220px;
  scroll-snap-align: start;
  padding: 48px 18px 16px;
  border-radius: 18px;
  background: white;
  border: 2px solid rgba(72,80,84,0.08);
  box-shadow: 0 4px 16px rgba(72,80,84,0.08);
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: ${fadeIn} 0.35s ${p => p.$idx * 0.06}s ease both;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(72,80,84,0.15);
  }
`;

const ExpandedBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  background: #f1f3f5;
  color: #9ca3af;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const SpinnerWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 14px;
  animation: ${fadeUp} 0.3s ease both;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3.5px solid #f1f3f5;
  border-top-color: ${Pista8Theme.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const SpinnerText = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #a8b0b8;
  margin: 0;
`;

const formatRelative = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
};

const rawToPlane = (idea: RawIdea, index: number, userProfile?: any): PlaneIdea => {
  const isCurrentUser = userProfile && idea.authorId === userProfile.id;
  const authorName = idea.isAnonymous
    ? 'Anónimo'
    : isCurrentUser && userProfile
      ? resolveDisplayName(userProfile as any)
      : resolveDisplayName(idea.author);

  return {
  id: idea.id ?? idea._id ?? String(index),
  title: idea.title,
  challengeId: idea.challengeId,
  challengeTitle: idea.challengeTitle,
  authorName,
  likesCount: idea.likesCount ?? 0,
  commentsCount: idea.commentsCount ?? 0,
  goodCount: idea.goodCount ?? 0,
  futureCount: idea.futureCount ?? 0,
  complexCount: idea.complexCount ?? 0,
  fireScore: idea.fireScore ?? 0,
  laneY: 0,
  floatDelay: 0,
  authorFacultyId: idea.author?.studentProfile?.facultyId || idea.author?.facultyId,
  problem: idea.problem,
  solution: idea.solution,
  hasVoted: idea.hasVoted ?? false,
  hasFavorited: idea.hasFavorited ?? false,
  authorId: idea.authorId ?? '',
  createdAt: idea.createdAt,
  authorRealName: idea.author?.displayName,
  authorStudentCode: idea.author?.studentCode,
  authorPhone: idea.author?.phone,
  };
};

interface IdeasChronologicalListProps {
  ideas: RawIdea[];
  sortOrder: SortMode;
  isLoading?: boolean;
  onSelectIdea?: (idea: PlaneIdea) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
  isVertical?: boolean;
}

const IdeasChronologicalList: React.FC<IdeasChronologicalListProps> = ({
  ideas,
  sortOrder,
  isLoading,
  onSelectIdea,
  showAll,
  onToggleShowAll,
  isVertical = false,
}) => {
  const { userProfile } = useAuth();
  const [localIdeas, setLocalIdeas] = React.useState(ideas);

  React.useEffect(() => {
    setLocalIdeas(ideas);
  }, [ideas]);

  useWallEventListener('comment_count_changed', ({ ideaId, count }) => {
    if (!ideaId) return;

    if (typeof count === 'number' && count >= 0) {
      setLocalIdeas(prev => prev.map(idea => (idea.id === ideaId || idea._id === ideaId ? { ...idea, commentsCount: count } : idea)));
      return;
    }

    commentService
      .getComments({ ideaId, page: 1, limit: 1 })
      .then((res) => {
        const total = res.data.total ?? undefined;
        if (typeof total === 'number') {
          setLocalIdeas(prev => prev.map(idea => (idea.id === ideaId || idea._id === ideaId ? { ...idea, commentsCount: total } : idea)));
        }
      })
      .catch(() => {
      });
  });

  if (isLoading) {
    return (
      <Wrapper>
        <SpinnerWrap>
          <Spinner />
          <SpinnerText>Cargando ideas...</SpinnerText>
        </SpinnerWrap>
      </Wrapper>
    );
  }

  if (ideas.length === 0) return <IdeationGuidePanel />;

  const sortLabel =
    sortOrder === 'newest' ? 'Más recientes' :
    sortOrder === 'oldest' ? 'Más antiguas' :
    sortOrder === 'likes' ? 'Más populares' :
    'Más comentadas';

  const top3 = localIdeas.slice(0, 3);
  const rest = localIdeas.slice(3);

  return (
    <Wrapper>
      <Header>
        <HeaderLeft>
          <Title>{sortLabel}</Title>
        </HeaderLeft>
        {ideas.length > 3 && !showAll && (
          <ViewAllBtn onClick={onToggleShowAll}>
            Ver Todos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </ViewAllBtn>
        )}
        {showAll && (
          <ViewAllBtn onClick={onToggleShowAll}>
            Solo Top 3
          </ViewAllBtn>
        )}
      </Header>

      <TopGrid $count={top3.length} $isVertical={isVertical}>
        {top3.map((idea, i) => {
          const isCurrentUser = userProfile && idea.authorId === userProfile.id;
          const authorName = idea.isAnonymous
            ? 'Anónimo'
            : isCurrentUser && userProfile
              ? resolveDisplayName(userProfile as any)
              : resolveDisplayName(idea.author);

          return (
            <TopCard
              key={idea.id ?? idea._id ?? i}
              $rank={i}
              $idx={i}
              $isVertical={isVertical}
              onClick={() => onSelectIdea?.(rawToPlane(idea, i, userProfile))}
            >
              <MedalBadge $rank={i}>{medalStyles[i]?.label}</MedalBadge>

              <CardTitle>{idea.title}</CardTitle>
              <CardAuthor>por {authorName}</CardAuthor>

              <CardStats $isVertical={isVertical}>
                <StatItem $tooltipText="Interacciones totales">
                  <Sparkles size={14} fill={(idea.likesCount ?? 0) > 0 ? '#ef4444' : 'none'} stroke={(idea.likesCount ?? 0) > 0 ? '#ef4444' : 'currentColor'} />
                  <StatValue>{idea.likesCount ?? 0}</StatValue>
                </StatItem>
                <StatItem $tooltipText="Comentarios">
                  <MessageSquare size={14} />
                  <StatValue>{idea.commentsCount ?? 0}</StatValue>
                </StatItem>
                <DateLabel>{formatRelative(idea.createdAt)}</DateLabel>
              </CardStats>
            </TopCard>
          );
        })}
      </TopGrid>

      {showAll && rest.length > 0 && (
        <ExpandedGrid layout>
          {rest.map((idea, i) => {
            const idx = i + 3;
            const isCurrentUser = userProfile && idea.authorId === userProfile.id;
            const authorName = idea.isAnonymous
              ? 'Anónimo'
              : isCurrentUser && userProfile
                ? resolveDisplayName(userProfile as any)
                : resolveDisplayName(idea.author);

            return (
              <ExpandedCard
                layout
                key={idea.id ?? idea._id ?? idx}
                $rank={idx}
                $idx={i}
                onClick={() => onSelectIdea?.(rawToPlane(idea, idx, userProfile))}
              >
                <ExpandedBadge $rank={idx}>#{idx + 1}</ExpandedBadge>
                
                <CardTitle>{idea.title}</CardTitle>
                <CardAuthor>por {authorName}</CardAuthor>

                <CardStats>
                  <StatItem $tooltipText="Interacciones totales">
                    <Sparkles size={14} fill={(idea.likesCount ?? 0) > 0 ? '#ef4444' : 'none'} stroke={(idea.likesCount ?? 0) > 0 ? '#ef4444' : 'currentColor'} />
                    <StatValue>{idea.likesCount ?? 0}</StatValue>
                  </StatItem>
                  <StatItem $tooltipText="Comentarios">
                    <MessageSquare size={14} />
                    <StatValue>{idea.commentsCount ?? 0}</StatValue>
                  </StatItem>
                </CardStats>

                <DateLabel>{formatRelative(idea.createdAt)}</DateLabel>
              </ExpandedCard>
            );
          })}
        </ExpandedGrid>
      )}
    </Wrapper>
  );
};

export default IdeasChronologicalList;
