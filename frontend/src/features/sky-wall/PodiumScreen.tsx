import { memo, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { PlaneIdea } from './types';
import { User, Trophy, Star } from 'lucide-react';

/* ─── animations ─── */

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
`;

const fadeInOut = keyframes`
  0%   { opacity: 0; transform: scale(0.95); }
  20%  { opacity: 1; transform: scale(1); }
  80%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; visibility: hidden; transform: scale(1.05); }
`;

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/* ─── layout ─── */

const Screen = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 40px 24px;
  pointer-events: none;
`;

const TopBanner = styled.div<{ $delay: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #FE410A, #FF7B00);
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  box-shadow: 0 4px 20px rgba(254, 65, 10, 0.4);
  animation: ${slideDown} 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${p => p.$delay}s both;
  z-index: 30;
`;

const IntroTitle = styled.h2`
  font-size: 3rem;
  font-weight: 900;
  color: white;
  margin: 0;
  letter-spacing: -1px;
  text-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.6);
  animation: ${fadeInOut} 4.5s ease both;
  position: absolute;
  top: 40%;
`;

const IntroSubtitle = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-top: 16px;
  animation: ${fadeInOut} 4.5s ease both;
  position: absolute;
  top: calc(40% + 60px);
  text-shadow: 0 2px 10px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.8);
`;

const PodiumContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  animation: ${riseIn} 0.8s ease 5s both;
`;

const PodiumRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 28px;
  justify-content: center;
  width: 100%;
  max-width: 860px;
  margin-top: 60px;
  pointer-events: auto;
`;

/* ─── card ─── */

const glowFirst = css`
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 22px;
    background: linear-gradient(135deg, #FE410A, #FF8C00, #FE410A);
    background-size: 200% 200%;
    animation: ${shimmer} 3s linear infinite;
    z-index: -1;
  }
`;

const PodiumCard = styled.div<{ $rank: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: ${p => p.$rank === 1 ? '230px' : '200px'};
  border-radius: 20px;
  background: linear-gradient(
    170deg,
    ${p => p.$rank === 1
      ? 'rgba(72, 80, 84, 0.75) 0%, rgba(30, 30, 30, 0.95) 100%'
      : 'rgba(72, 80, 84, 0.55) 0%, rgba(38, 38, 38, 0.9) 100%'}
  );
  border: 2px solid ${p =>
    p.$rank === 1 ? '#FE410A' :
    p.$rank === 2 ? 'rgba(255,255,255,0.2)' :
    'rgba(255,255,255,0.15)'};
  position: relative;
  box-shadow: ${p => p.$rank === 1
    ? '0 20px 50px rgba(254, 65, 10, 0.3), 0 8px 20px rgba(0,0,0,0.4)'
    : '0 20px 45px rgba(0,0,0,0.45)'};
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: ${p => p.$rank === 1 ? '36px 22px 22px' : '32px 18px 18px'};
  order: ${p => (p.$rank === 1 ? 0 : p.$rank === 2 ? -1 : 1)};
  transform-origin: bottom center;
  z-index: ${p => p.$rank === 1 ? 2 : 1};

  ${p => p.$rank === 1 && glowFirst}

  ${p => p.$rank === 1 && `
    transform: scale(1.06);
  `}

  &:hover {
    transform: ${p => p.$rank === 1 ? 'scale(1.08)' : 'scale(1.03)'};
    box-shadow: ${p => p.$rank === 1
      ? '0 24px 56px rgba(254, 65, 10, 0.4), 0 10px 24px rgba(0,0,0,0.45)'
      : '0 24px 52px rgba(0,0,0,0.5)'};
  }
`;

/* ─── badge ─── */

const RankBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: ${p =>
    p.$rank === 1 ? 'linear-gradient(135deg, #FE410A, #FF8C00)' :
    p.$rank === 2 ? 'linear-gradient(135deg, #64748b, #485054)' :
    'linear-gradient(135deg, #b45309, #78350f)'};
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 900;
  box-shadow: 0 4px 14px ${p =>
    p.$rank === 1 ? 'rgba(254, 65, 10, 0.5)' :
    'rgba(0,0,0,0.35)'};
  border: 2px solid rgba(255,255,255,0.25);
`;

/* ─── avatar ─── */

const AvatarContainer = styled.div<{ $rank: number }>`
  width: ${p => (p.$rank === 1 ? '72px' : '60px')};
  height: ${p => (p.$rank === 1 ? '72px' : '60px')};
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${p =>
    p.$rank === 1 ? '#FE410A' :
    p.$rank === 2 ? '#64748b' :
    '#b45309'};
  background: #485054;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

/* ─── text ─── */

const IdeaTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
  text-align: center;
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
`;

const AuthorName = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 500;
  text-align: center;
`;

/* ─── score ─── */

const ScoreBadge = styled.div<{ $rank: number }>`
  margin-top: auto;
  background: ${p => p.$rank === 1
    ? 'linear-gradient(135deg, rgba(254,65,10,0.2), rgba(255,140,0,0.15))'
    : 'rgba(255, 255, 255, 0.08)'};
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 800;
  color: ${p => p.$rank === 1 ? '#FF8C00' : 'rgba(255,255,255,0.7)'};
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid ${p => p.$rank === 1
    ? 'rgba(254,65,10,0.25)'
    : 'rgba(255,255,255,0.08)'};
`;

/* ─── divider ─── */

const Divider = styled.div<{ $rank: number }>`
  width: 40px;
  height: 2px;
  border-radius: 2px;
  background: ${p => p.$rank === 1
    ? 'linear-gradient(90deg, transparent, #FE410A, transparent)'
    : 'rgba(255,255,255,0.12)'};
`;

/* ─── component ─── */

interface PodiumScreenProps {
  ideas: PlaneIdea[];
}

const PodiumScreen = memo(({ ideas }: PodiumScreenProps) => {
  const top3 = useMemo(() => {
    const scored = [...ideas]
      .filter(idea => (idea.finalScore || 0) > 0)
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
      .slice(0, 3);

    if (scored.length > 0) return scored;

    // Fallback: show top 3 by likes if no finalScores
    return [...ideas]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 3);
  }, [ideas]);

  return (
    <Screen>
      <TopBanner $delay={6}>
        <Trophy size={20} /> Reto Finalizado
      </TopBanner>

      <IntroTitle>¡Conoce a los Ganadores!</IntroTitle>
      <IntroSubtitle>Las ideas aparecerán aquí al publicarse</IntroSubtitle>

      <PodiumContainer>
        <PodiumRow>
          {top3.map((idea, i) => (
            <PodiumCard key={idea.id} $rank={i + 1}>
              <RankBadge $rank={i + 1}>{i + 1}</RankBadge>
              <AvatarContainer $rank={i + 1}>
                {idea.authorAvatar ? (
                  <img src={idea.authorAvatar} alt={idea.authorName} />
                ) : (
                  <User size={i === 0 ? 32 : 26} color="rgba(255,255,255,0.5)" />
                )}
              </AvatarContainer>
              <IdeaTitle>{idea.title}</IdeaTitle>
              <Divider $rank={i + 1} />
              <AuthorName>
                {idea.authorRealName || idea.authorName}
              </AuthorName>
              <ScoreBadge $rank={i + 1}>
                <Star size={13} fill="currentColor" />
                {idea.finalScore ? idea.finalScore.toFixed(1) : 0} pts
              </ScoreBadge>
            </PodiumCard>
          ))}
        </PodiumRow>
      </PodiumContainer>
    </Screen>
  );
});

PodiumScreen.displayName = 'PodiumScreen';
export default PodiumScreen;
