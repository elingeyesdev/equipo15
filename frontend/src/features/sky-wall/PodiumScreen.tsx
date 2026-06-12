import { memo, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
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

/* ─── layout ─── */

const Screen = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  z-index: 20;
  padding: 130px 24px 20px;
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
  top: 30%;
`;

const IntroSubtitle = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-top: 16px;
  animation: ${fadeInOut} 4.5s ease both;
  position: absolute;
  top: calc(30% + 60px);
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
  margin-top: 20px;
  pointer-events: auto;
`;

/* ─── card theme ─── */

const RANK_THEMES: Record<number, {
  bg: string;
  border: string;
  shadow: string;
  badgeBg: string;
  textPrimary: string;
  textSecondary: string;
  scoreBg: string;
  scoreText: string;
  divider: string;
}> = {
  1: { // 1st Place (Oro)
    bg: 'linear-gradient(135deg, #fffbf0, #ffdd87)',
    border: '#ea9518',
    shadow: '0 10px 25px rgba(234, 149, 24, 0.2), 0 4px 10px rgba(0,0,0,0.15)',
    badgeBg: 'linear-gradient(135deg, #ea9518, #f4ea2a)',
    textPrimary: '#1a1f22',
    textSecondary: '#6b7578',
    scoreBg: 'rgba(234, 149, 24, 0.12)',
    scoreText: '#ea9518',
    divider: '#ea9518',
  },
  2: { // 2nd Place (Plata)
    bg: 'linear-gradient(135deg, #f3f4f6, #cfd5db)',
    border: '#7f8c8d',
    shadow: '0 10px 25px rgba(127, 140, 141, 0.15), 0 4px 10px rgba(0,0,0,0.15)',
    badgeBg: 'linear-gradient(135deg, #7f8c8d, #bdc3c7)',
    textPrimary: '#1a1f22',
    textSecondary: '#6b7578',
    scoreBg: 'rgba(127, 140, 141, 0.12)',
    scoreText: '#7f8c8d',
    divider: '#7f8c8d',
  },
  3: { // 3rd Place (Bronce)
    bg: 'linear-gradient(135deg, #fff2e6, #e6b89c)',
    border: '#d35400',
    shadow: '0 10px 25px rgba(211, 84, 0, 0.15), 0 4px 10px rgba(0,0,0,0.15)',
    badgeBg: 'linear-gradient(135deg, #d35400, #e67e22)',
    textPrimary: '#1a1f22',
    textSecondary: '#6b7578',
    scoreBg: 'rgba(211, 84, 0, 0.12)',
    scoreText: '#d35400',
    divider: '#d35400',
  }
};

const PodiumCard = styled.div<{ $rank: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: ${p => p.$rank === 1 ? '230px' : '200px'};
  border-radius: 20px;
  background: ${p => RANK_THEMES[p.$rank]?.bg ?? 'white'};
  border: 2px solid ${p => RANK_THEMES[p.$rank]?.border ?? '#eee'};
  position: relative;
  box-shadow: ${p => RANK_THEMES[p.$rank]?.shadow ?? '0 10px 25px rgba(0,0,0,0.1)'};
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: ${p => p.$rank === 1 ? '36px 22px 22px' : '32px 18px 18px'};
  order: ${p => (p.$rank === 1 ? 0 : p.$rank === 2 ? -1 : 1)};
  transform-origin: bottom center;
  z-index: ${p => p.$rank === 1 ? 2 : 1};

  ${p => p.$rank === 1 && `
    transform: scale(1.06);
  `}

  &:hover {
    transform: ${p => p.$rank === 1 ? 'scale(1.08)' : 'scale(1.03)'};
    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  }
`;

/* ─── badge ─── */

const RankBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: ${p => RANK_THEMES[p.$rank]?.badgeBg ?? '#333'};
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 900;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  border: 2px solid white;
`;

/* ─── avatar ─── */

const AvatarContainer = styled.div<{ $rank: number }>`
  width: ${p => (p.$rank === 1 ? '72px' : '60px')};
  height: ${p => (p.$rank === 1 ? '72px' : '60px')};
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${p => RANK_THEMES[p.$rank]?.border ?? '#333'};
  background: #f3f4f6;
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

const IdeaTitle = styled.h3<{ $rank: number }>`
  font-size: 0.95rem;
  font-weight: 800;
  color: ${p => RANK_THEMES[p.$rank]?.textPrimary ?? '#111'};
  margin: 0;
  text-align: center;
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
`;

const AuthorName = styled.p<{ $rank: number }>`
  font-size: 0.85rem;
  color: ${p => RANK_THEMES[p.$rank]?.textSecondary ?? '#666'};
  margin: 0;
  font-weight: 600;
  text-align: center;
`;

/* ─── score ─── */

const ScoreBadge = styled.div<{ $rank: number }>`
  margin-top: auto;
  background: ${p => RANK_THEMES[p.$rank]?.scoreBg ?? '#eee'};
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 800;
  color: ${p => RANK_THEMES[p.$rank]?.scoreText ?? '#333'};
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid ${p => RANK_THEMES[p.$rank]?.border ?? '#ccc'}20;
`;

/* ─── divider ─── */

const Divider = styled.div<{ $rank: number }>`
  width: 40px;
  height: 2px;
  border-radius: 2px;
  background: ${p => RANK_THEMES[p.$rank]?.divider ?? '#eee'}40;
`;

/* ─── component ─── */

interface PodiumScreenProps {
  ideas: PlaneIdea[];
  onSelectIdea?: (idea: PlaneIdea) => void;
}

const PodiumScreen = memo(({ ideas, onSelectIdea }: PodiumScreenProps) => {
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
            <PodiumCard key={idea.id} $rank={i + 1} onClick={() => onSelectIdea?.(idea)}>
              <RankBadge $rank={i + 1}>{i + 1}</RankBadge>
              <AvatarContainer $rank={i + 1}>
                {idea.authorAvatar ? (
                  <img src={idea.authorAvatar} alt={idea.authorName} />
                ) : (
                  <User size={i === 0 ? 32 : 26} color={RANK_THEMES[i + 1]?.textSecondary ?? '#64748b'} />
                )}
              </AvatarContainer>
              <IdeaTitle $rank={i + 1}>{idea.title}</IdeaTitle>
              <Divider $rank={i + 1} />
              <AuthorName $rank={i + 1}>
                {(() => {
                  const real = idea.authorRealName || '';
                  const resolved = idea.authorName || '';
                  if (resolved && resolved !== 'Anonimo') return resolved;
                  if (real) return real;
                  return 'Participante';
                })()}
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
