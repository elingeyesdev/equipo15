import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import type { RawIdea, PlaneIdea, SortMode } from '../../../features/sky-wall/types';
import { resolveDisplayName } from '../../../utils/user.utils';

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

/* ─── Layout ─── */
const Wrapper = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.35s ease both;
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

const Counter = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #a8b0b8;
  background: #f1f3f5;
  padding: 2px 8px;
  border-radius: 20px;
`;

const ViewAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(254,65,10,0.2);
  background: white;
  color: ${Pista8Theme.primary};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(254,65,10,0.05);
    border-color: ${Pista8Theme.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254,65,10,0.12);
  }

  svg { width: 12px; height: 12px; }
`;

/* ─── Top 3 horizontal cards ─── */
const TopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

const TopCard = styled.div<{ $rank: number; $idx: number }>`
  position: relative;
  padding: 20px 18px 16px;
  border-radius: 18px;
  background: ${p => medalStyles[p.$rank]?.bg ?? 'white'};
  border: 2px solid ${p => medalStyles[p.$rank]?.border ?? 'rgba(72,80,84,0.08)'};
  box-shadow: 0 4px 16px rgba(72,80,84,0.08);
  animation: ${fadeUp} 0.35s ${p => p.$idx * 0.08}s ease both;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

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
  padding-right: 36px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardAuthor = styled.p`
  font-size: 11px;
  font-weight: 500;
  color: #a8b0b8;
  margin: 0 0 10px;
`;

const CardStats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatChip = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
`;

const DateLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #c0c8d0;
  margin-left: auto;
`;

/* ─── Full list cards ─── */
const FullList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${fadeUp} 0.25s ease both;
`;

const ListCard = styled.div<{ $index: number }>`
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 2px 8px rgba(72, 80, 84, 0.06);
  animation: ${fadeUp} 0.3s ${p => p.$index * 0.03}s ease both;
  cursor: pointer;
  transition: all 0.18s;

  &:hover {
    box-shadow: 0 6px 20px rgba(72, 80, 84, 0.12);
    transform: translateY(-2px);
    border-color: rgba(254, 65, 10, 0.18);
  }
`;

const Rank = styled.div<{ $index: number }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  flex-shrink: 0;
  background: ${p => medalStyles[p.$index]?.badge ?? '#f1f3f5'};
  color: ${p => medalStyles[p.$index]?.badgeText ?? '#9ca3af'};
  box-shadow: ${p => p.$index < 3 ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'};
`;

const Info = styled.div`
  min-width: 0;
`;

const ListTitle = styled.p`
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1f22;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.p`
  font-size: 11px;
  font-weight: 500;
  color: #a8b0b8;
  margin: 0;
`;

/* ─── Loading Spinner ─── */
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

/* ─── Helpers ─── */
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

const rawToPlane = (idea: RawIdea, index: number): PlaneIdea => ({
  id: idea.id ?? idea._id ?? String(index),
  title: idea.title,
  challengeTitle: idea.challengeTitle,
  authorName: idea.isAnonymous
    ? 'Anónimo'
    : resolveDisplayName(idea.author),
  likesCount: idea.likesCount ?? 0,
  commentsCount: idea.commentsCount ?? 0,
  laneY: 0,
  floatDelay: 0,
  authorFacultyId: idea.author?.facultyId,
  problem: idea.problem,
  solution: idea.solution,
  hasVoted: idea.hasVoted ?? false,
  authorId: idea.authorId ?? '',
  createdAt: idea.createdAt,
  authorRealName: idea.author?.displayName,
  authorStudentCode: idea.author?.studentCode,
  authorPhone: idea.author?.phone,
});

/* ─── Component ─── */
interface IdeasChronologicalListProps {
  ideas: RawIdea[];
  sortOrder: SortMode;
  isLoading?: boolean;
  onSelectIdea?: (idea: PlaneIdea) => void;
}

const IdeasChronologicalList: React.FC<IdeasChronologicalListProps> = ({
  ideas,
  sortOrder,
  isLoading,
  onSelectIdea,
}) => {
  const [showAll, setShowAll] = useState(false);

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

  if (ideas.length === 0) return null;

  const sortLabel =
    sortOrder === 'newest' ? 'Más recientes' :
    sortOrder === 'oldest' ? 'Más antiguas' :
    sortOrder === 'likes' ? 'Más populares' :
    'Más comentadas';

  const top3 = ideas.slice(0, 3);
  const rest = ideas.slice(3);

  return (
    <Wrapper>
      <Header>
        <HeaderLeft>
          <Title>{sortLabel}</Title>
          <Counter>Top 3</Counter>
        </HeaderLeft>
        {ideas.length > 3 && !showAll && (
          <ViewAllBtn onClick={() => setShowAll(true)}>
            Ver Todos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </ViewAllBtn>
        )}
        {showAll && (
          <ViewAllBtn onClick={() => setShowAll(false)}>
            Solo Top 3
          </ViewAllBtn>
        )}
      </Header>

      {/* ─── Top 3 Horizontal Cards ─── */}
      <TopGrid>
        {top3.map((idea, i) => {
          const authorName = idea.isAnonymous
            ? 'Anónimo'
            : resolveDisplayName(idea.author);

          return (
            <TopCard
              key={idea.id ?? idea._id ?? i}
              $rank={i}
              $idx={i}
              onClick={() => onSelectIdea?.(rawToPlane(idea, i))}
            >
              <MedalBadge $rank={i}>{medalStyles[i]?.label}</MedalBadge>

              <CardTitle>{idea.title}</CardTitle>
              <CardAuthor>por {authorName}</CardAuthor>

              <CardStats>
                <StatChip>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {idea.likesCount ?? 0}
                </StatChip>
                <StatChip>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {idea.commentsCount ?? 0}
                </StatChip>
                <DateLabel>{formatRelative(idea.createdAt)}</DateLabel>
              </CardStats>
            </TopCard>
          );
        })}
      </TopGrid>

      {/* ─── Full List (when "Ver Todos") ─── */}
      {showAll && rest.length > 0 && (
        <FullList>
          {rest.map((idea, i) => {
            const idx = i + 3;
            const authorName = idea.isAnonymous
              ? 'Anónimo'
              : resolveDisplayName(idea.author);

            return (
              <ListCard
                key={idea.id ?? idea._id ?? idx}
                $index={i}
                onClick={() => onSelectIdea?.(rawToPlane(idea, idx))}
              >
                <Rank $index={idx}>#{idx + 1}</Rank>
                <Info>
                  <ListTitle>{idea.title}</ListTitle>
                  <Meta>por {authorName} · {formatRelative(idea.createdAt)}</Meta>
                </Info>
                <CardStats>
                  <StatChip>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {idea.likesCount ?? 0}
                  </StatChip>
                  <StatChip>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {idea.commentsCount ?? 0}
                  </StatChip>
                </CardStats>
              </ListCard>
            );
          })}
        </FullList>
      )}
    </Wrapper>
  );
};

export default IdeasChronologicalList;
