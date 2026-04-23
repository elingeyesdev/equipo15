import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import type { RawIdea, PlaneIdea, SortMode } from '../../../features/sky-wall/types';
import { resolveDisplayName } from '../../../utils/user.utils';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  margin-top: 1.5rem;
  margin-bottom: 2.5rem;        /* ← separa del MainGrid */
  animation: ${fadeUp} 0.35s ease both;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IdeaCard = styled.div<{ $index: number }>`
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 2px 8px rgba(72, 80, 84, 0.06);
  animation: ${fadeUp} 0.3s ${p => p.$index * 0.04}s ease both;
  transition: box-shadow 0.18s, transform 0.15s, border-color 0.15s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 6px 20px rgba(72, 80, 84, 0.12);
    transform: translateY(-2px);
    border-color: rgba(254, 65, 10, 0.18);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Rank = styled.div<{ $top: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  flex-shrink: 0;
  background: ${p => p.$top ? Pista8Theme.primary : '#f1f3f5'};
  color: ${p => p.$top ? 'white' : '#9ca3af'};
`;

const Info = styled.div`
  min-width: 0;
`;

const IdeaTitle = styled.p`
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

const DateSection = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const DateRelative = styled.p`
  font-size: 11.5px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 2px;
`;

const DateFull = styled.p`
  font-size: 10px;
  font-weight: 500;
  color: #c0c8d0;
  margin: 0;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

const StatChip = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  font-weight: 600;
  color: #9ca3af;
`;

const ViewHint = styled.span`
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
  opacity: 0;
  transition: opacity 0.15s;

  ${IdeaCard}:hover & {
    opacity: 1;
  }
`;

const formatRelative = (dateStr?: string): string => {
  if (!dateStr) return 'Fecha desconocida';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`;
};

const formatFull = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const rawToPlane = (idea: RawIdea, index: number): PlaneIdea => ({
  id: idea.id ?? idea._id ?? String(index),
  title: idea.title,
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
  authorId: idea.authorId || '',
  createdAt: idea.createdAt,
  authorRealName: idea.author?.displayName,
  authorStudentCode: idea.author?.studentCode,
  authorPhone: idea.author?.phone,
});

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
  if (isLoading || ideas.length === 0) return null;

  return (
    <Wrapper>
      <Header>
        <Title>
          {sortOrder === 'newest' ? 'Más recientes' :
           sortOrder === 'oldest' ? 'Más antiguas' :
           sortOrder === 'likes' ? 'Más populares' :
           'Más comentadas'}
        </Title>
        <Counter>{ideas.length} idea{ideas.length !== 1 ? 's' : ''}</Counter>
      </Header>

      <List>
        {ideas.map((idea, i) => {
          const authorName = idea.isAnonymous
            ? 'Anónimo'
            : resolveDisplayName(idea.author);

          return (
            <IdeaCard
              key={idea.id ?? idea._id ?? i}
              $index={i}
              onClick={() => onSelectIdea?.(rawToPlane(idea, i))}
            >
              <Rank $top={i === 0}>#{i + 1}</Rank>

              <Info>
                <IdeaTitle>{idea.title}</IdeaTitle>
                <Meta>por {authorName}</Meta>
                <StatsRow>
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
                  <ViewHint>Ver idea →</ViewHint>
                </StatsRow>
              </Info>

              <DateSection>
                <DateRelative>{formatRelative(idea.createdAt)}</DateRelative>
                <DateFull>{formatFull(idea.createdAt)}</DateFull>
              </DateSection>
            </IdeaCard>
          );
        })}
      </List>
    </Wrapper>
  );
};

export default IdeasChronologicalList;
