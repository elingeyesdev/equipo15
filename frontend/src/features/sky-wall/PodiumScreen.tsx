import { memo, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import type { PlaneIdea } from './types';
import planeImg from '../../assets/logo_avion.png';

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Screen = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #0b0f1a 0%, #1a2540 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 40px 24px;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 900;
  color: white;
  margin: 0 0 40px;
  letter-spacing: -0.5px;
`;

const PodiumRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;
  justify-content: center;
  width: 100%;
  max-width: 900px;
`;

const PodiumCard = styled.div<{ $rank: number; $delay: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 24px 20px 20px;
  min-width: 140px;
  animation: ${riseIn} 0.6s ease ${p => p.$delay}s both;
  order: ${p => (p.$rank === 1 ? 0 : p.$rank === 2 ? -1 : 1)};
  transform-origin: bottom center;
`;

const Rank = styled.span<{ $rank: number }>`
  font-size: ${p => (p.$rank === 1 ? '2.2rem' : '1.4rem')};
  font-weight: 900;
  color: ${p => (p.$rank === 1 ? '#FFD700' : p.$rank === 2 ? '#C0C0C0' : '#CD7F32')};
`;

const PlaneThumb = styled.img<{ $rank: number }>`
  width: ${p => (p.$rank === 1 ? 72 : 52)}px;
  height: ${p => (p.$rank === 1 ? 72 : 52)}px;
  object-fit: contain;
`;

const IdeaTitle = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin: 0;
`;

const Author = styled.p`
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  margin: 0;
  text-align: center;
`;

const Score = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: #FE410A;
`;

interface PodiumScreenProps {
  ideas: PlaneIdea[];
}

const PodiumScreen = memo(({ ideas }: PodiumScreenProps) => {
  const top5 = useMemo(
    () =>
      [...ideas]
        .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
        .slice(0, 5),
    [ideas],
  );

  return (
    <Screen>
      <Title>Ideas Ganadoras</Title>
      <PodiumRow>
        {top5.map((idea, i) => (
          <PodiumCard key={idea.id} $rank={i + 1} $delay={i * 0.12}>
            <Rank $rank={i + 1}>{i + 1}</Rank>
            <PlaneThumb src={planeImg} alt="" $rank={i + 1} />
            <IdeaTitle>{idea.title.slice(0, 30)}</IdeaTitle>
            <Author>{idea.authorName}</Author>
            <Score>{idea.likesCount + idea.commentsCount} pts</Score>
          </PodiumCard>
        ))}
      </PodiumRow>
    </Screen>
  );
});

PodiumScreen.displayName = 'PodiumScreen';
export default PodiumScreen;
