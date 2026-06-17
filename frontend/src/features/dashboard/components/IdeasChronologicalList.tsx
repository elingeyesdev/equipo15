import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare } from 'lucide-react';
import IdeationGuidePanel from './IdeationGuidePanel';
import { Pista8Theme } from '../../../config/theme';
import { interactiveHover, premiumTooltip } from '../styles/CommonStyles';
import type { RawIdea, PlaneIdea, SortMode } from '../../../features/sky-wall/types';
import { resolveDisplayName } from '../../../utils/user.utils';
import { useAuth } from '../../../context/AuthContext';
import { useWallEventListener } from '../../../hooks/useWallEvents';
import { commentService } from '../../../services/comment.service';



const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const Wrapper = styled.div<{ $showAll?: boolean }>`
  background: ${p => p.$showAll ? 'transparent' : 'white'};
  border-radius: 24px;
  padding: ${p => p.$showAll ? '28px 0' : '28px 28px'};
  border: ${p => p.$showAll ? 'none' : '1px solid rgba(72, 80, 84, 0.08)'};
  box-shadow: ${p => p.$showAll ? 'none' : '0 2px 16px rgba(72, 80, 84, 0.06)'};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;

  /* Scrollbar invisible */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 640px) {
    padding: ${p => p.$showAll ? '20px 0' : '20px 16px'};
  }
`;

const Header = styled.div<{ $showAll?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-left: 18px;
  padding-right: 4px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: ${(p: { $showAll?: boolean }) => p.$showAll ? Pista8Theme.background : 'white'};
  z-index: 10;
  padding-top: 8px;
  padding-bottom: 12px;
  margin-top: -8px;

  @media (max-width: 640px) {
    padding-left: 0;
    padding-right: 0;
    position: relative;
    z-index: 1;
  }
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
  display: flex;
  flex-direction: ${p => p.$isVertical ? 'column' : 'row'};
  gap: 14px;
  flex: ${p => p.$count === 1 ? '1' : '0 0 auto'};
  ${p => p.$count === 1 && css`
    height: 100%;
  `}
`;

const IdeaCard = styled(motion.div)<{ $isVertical?: boolean; $idx?: number; $stretch?: boolean }>`
  position: relative;
  padding: 22px 20px 22px 18px;
  border-radius: 18px;
  background: #fafafa;
  border: 1.5px solid rgba(254, 65, 10, 0.12);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  ${p => p.$stretch && css`
    flex: 1;
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(72, 80, 84, 0.12);
    border-color: rgba(254, 65, 10, 0.28);
  }
`;

const VerticalRow = styled.div<{ $stretch?: boolean }>`
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  ${p => p.$stretch && css`
    flex: 1;
    flex-direction: column;
  `}
`;


const TopPodiumGrid = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 20px;
  width: 100%;
  height: 240px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    height: auto;
    gap: 16px;
    margin-top: 16px;
  }
`;

const PodiumIdeaCard = styled(motion.div)<{ $rank: number }>`
  position: relative;
  border-radius: 20px;
  background: white;
  border: 1.5px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px 18px 16px;
  flex: 1;
  min-width: 0;

  order: ${p => p.$rank === 1 ? 2 : p.$rank === 2 ? 1 : 3};
  height: ${p => p.$rank === 1 ? '100%' : p.$rank === 2 ? '85%' : '72%'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(72, 80, 84, 0.12);
    border-color: rgba(72, 80, 84, 0.14);
  }

  @media (max-width: 640px) {
    order: ${p => p.$rank}; /* Keep natural order 1, 2, 3 on mobile */
    height: auto;
    padding: 24px 16px 16px;
    width: 100%;
    box-sizing: border-box;
  }
`;

const PodiumRankBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2.5px solid ${p => p.$rank === 1 ? '#fe410a' : p.$rank === 2 ? '#7f8c8d' : '#d35400'};
  color: ${p => p.$rank === 1 ? '#fe410a' : p.$rank === 2 ? '#7f8c8d' : '#d35400'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
`;

const CarouselWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  margin-top: 20px;
`;

const CarouselContainer = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
  align-items: stretch;
`;

const CarouselNavBtn = styled.button<{ $disabled: boolean; $left?: boolean }>`
  background: transparent;
  border: none;
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.$disabled ? 0.35 : 1};
  transition: all 0.25s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    ${p => !p.$disabled && 'transform: scale(1.05);'}
  }
  &:active {
    ${p => !p.$disabled && 'transform: scale(0.95);'}
  }

  .outer-ring {
    width: 64px;
    height: 64px;
    background: rgba(254, 65, 10, 0.05);
    border-radius: 50%;
    position: relative;
    box-shadow: inset 0px 0px 1px 1px rgba(0, 0, 0, 0.15), 2px 3px 5px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .shadow-overlay {
    position: absolute;
    width: 54px;
    height: 54px;
    z-index: 10;
    background: black;
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
    top: 4px;
    filter: blur(1px);
    opacity: 0.12;
  }

  .button-inner {
    cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
    position: absolute;
    width: 54px;
    height: 54px;
    background: linear-gradient(180deg, #fe410a 0%, #ff6b3d 100%);
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
    top: 4px;
    box-shadow: inset 0px 3px 2px #ff9e80, inset 0px -3px 0px #9e2600, 0px 0px 2px rgba(0,0,0,0.4);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;

    ${p => !p.$disabled && css`
      &:active {
        box-shadow: inset 0px 3px 2px rgba(255,158,128,0.5), inset 0px -3px 2px rgba(254,65,10,0.5), 0px 0px 2px rgba(0,0,0,0.4);
      }
    `}
  }

  .svg-wrap {
    width: 24px;
    fill: #ffeae6;
    filter: drop-shadow(0px 1.5px 1.5px rgba(0,0,0,0.4));
    display: flex;
    align-items: center;
    justify-content: center;
    transform: ${p => p.$left ? 'scaleX(-1)' : 'none'};
  }
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
  const authorName = isCurrentUser && userProfile
    ? userProfile.displayName || resolveDisplayName(userProfile as any)
    : idea.author?.displayName || resolveDisplayName(idea.author);

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
  challengeStatus: (idea as any).challengeStatus,
  };
};

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

interface IdeasChronologicalListProps {
  ideas: RawIdea[];
  sortOrder: SortMode;
  isLoading?: boolean;
  onSelectIdea?: (idea: PlaneIdea) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
  challengeStatus?: string;
}

const IdeasChronologicalList: React.FC<IdeasChronologicalListProps> = ({
  ideas,
  sortOrder,
  isLoading,
  onSelectIdea,
  showAll,
  onToggleShowAll,
  challengeStatus: _challengeStatus,
}) => {
  const { userProfile } = useAuth();
  const [localIdeas, setLocalIdeas] = React.useState(ideas);
  const [carouselIndex, setCarouselIndex] = React.useState(0);

  React.useEffect(() => {
    setLocalIdeas(ideas);
    setCarouselIndex(0);
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



  const top3 = (!showAll) ? localIdeas.slice(0, 3) : [];
  const rest = (!showAll) ? localIdeas.slice(3) : localIdeas;

  const maxIndex = Math.max(0, rest.length - 5);
  const visibleIdeas = rest.slice(carouselIndex, carouselIndex + 5);

  return (
    <Wrapper $showAll={showAll}>
      <Header $showAll={showAll}>
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

      {!showAll ? (
        <TopGrid $count={top3.length} $isVertical={true}>
          {top3.map((idea, i) => {
            const isCurrentUser = userProfile && idea.authorId === userProfile.id;
            const authorName = isCurrentUser && userProfile
              ? resolveDisplayName(userProfile as any)
              : resolveDisplayName(idea.author);
            const shouldStretch = top3.length === 1;

            return (
              <VerticalRow key={idea.id ?? idea._id ?? i} $stretch={shouldStretch}>
                <IdeaCard
                  $isVertical={true}
                  $idx={i}
                  $stretch={shouldStretch}
                  onClick={() => onSelectIdea?.(rawToPlane(idea, i, userProfile))}
                >
                  <CardTitle>{idea.title}</CardTitle>
                  <CardAuthor>por {authorName}</CardAuthor>

                  <CardStats $isVertical={true}>
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
                </IdeaCard>
              </VerticalRow>
            );
          })}
        </TopGrid>
      ) : (
        <>
          {top3.length > 0 && (
            <TopPodiumGrid>
              {top3.map((idea, i) => {
              const isCurrentUser = userProfile && idea.authorId === userProfile.id;
              const authorName = isCurrentUser && userProfile
                ? resolveDisplayName(userProfile as any)
                : resolveDisplayName(idea.author);
              const rank = i + 1;

              return (
                <PodiumIdeaCard
                  key={idea.id ?? idea._id ?? i}
                  $rank={rank}
                  onClick={() => onSelectIdea?.(rawToPlane(idea, i, userProfile))}
                >
                  <PodiumRankBadge $rank={rank}>
                    {rank === 1 ? '①' : rank === 2 ? '②' : '③'}
                  </PodiumRankBadge>

                  <CardTitle>{idea.title}</CardTitle>
                  <CardAuthor>por {authorName}</CardAuthor>

                  <CardStats $isVertical={false}>
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
                </PodiumIdeaCard>
              );
            })}
            </TopPodiumGrid>
          )}

          {rest.length > 0 && (
            <CarouselWrapper>
              <CarouselNavBtn
                type="button"
                $disabled={carouselIndex === 0}
                $left={true}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCarouselIndex(prev => Math.max(0, prev - 1));
                }}
              >
                <div className="outer-ring">
                  <div className="shadow-overlay" />
                  <div className="button-inner">
                    <div className="svg-wrap">
                      <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24">
                        <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CarouselNavBtn>

              <CarouselContainer>
                <AnimatePresence mode="popLayout">
                  {visibleIdeas.map((idea, i) => {
                    const idx = i + 3 + carouselIndex;
                    const isCurrentUser = userProfile && idea.authorId === userProfile.id;
                    const authorName = isCurrentUser && userProfile
                      ? resolveDisplayName(userProfile as any)
                      : resolveDisplayName(idea.author);

                    return (
                      <IdeaCard
                        key={idea.id ?? idea._id ?? idx}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25 }}
                        $isVertical={false}
                        onClick={() => onSelectIdea?.(rawToPlane(idea, idx, userProfile))}
                      >
                        <CardTitle>{idea.title}</CardTitle>
                        <CardAuthor>por {authorName}</CardAuthor>

                        <CardStats $isVertical={false}>
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
                      </IdeaCard>
                    );
                  })}
                </AnimatePresence>
              </CarouselContainer>

              <CarouselNavBtn
                type="button"
                $disabled={carouselIndex === maxIndex}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCarouselIndex(prev => Math.min(maxIndex, prev + 1));
                }}
              >
                <div className="outer-ring">
                  <div className="shadow-overlay" />
                  <div className="button-inner">
                    <div className="svg-wrap">
                      <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24">
                        <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CarouselNavBtn>
            </CarouselWrapper>
          )}


        </>
      )}
    </Wrapper>
  );
};

export default IdeasChronologicalList;
