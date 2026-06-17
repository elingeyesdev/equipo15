import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Grid = styled.div<{ $count?: number; $isNarrow?: boolean }>`
  ${p => p.$isNarrow ? css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    justify-content: flex-start;
    flex: 1;
    min-height: 0;
  ` : css`
    display: grid;
    grid-template-columns: ${p.$count === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))'};
    gap: 16px;
    justify-content: center;
    justify-items: center;
    width: 100%;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr !important;
      gap: 12px;
    }
  `}
`;

const RANK_CONFIG: Record<number, {
  bg: string;
  shadow: string;
  trophy: {
    p1: string;
    p2: string;
    p3: string;
    p4: string;
    p5: string;
  };
  medal: {
    ring1: string;
    ring2: string;
    ring3: string;
    border1: string;
    border2: string;
  }
}> = {
  0: { // 1st Place (Oro)
    bg: 'linear-gradient(45deg, #fffbf0, #ffdd87)',
    shadow: '0 10px 15px #b1985e',
    trophy: {
      p1: '#ea9518',
      p2: '#6e4a32',
      p3: '#f4ea2a',
      p4: '#f2be45',
      p5: '#FFF2A0',
    },
    medal: {
      ring1: '#FDDC3A',
      ring2: '#E3A815',
      ring3: '#F5CF41',
      border1: '#D19A0E',
      border2: '#F9D525',
    }
  },
  1: { // 2nd Place (Plata)
    bg: 'linear-gradient(45deg, #f3f4f6, #cfd5db)',
    shadow: '0 10px 15px #9ca3af',
    trophy: {
      p1: '#7f8c8d',
      p2: '#2c3e50',
      p3: '#ecf0f1',
      p4: '#bdc3c7',
      p5: '#ffffff',
    },
    medal: {
      ring1: '#E0E0E0',
      ring2: '#A0A0A0',
      ring3: '#D0D0D0',
      border1: '#909090',
      border2: '#E8E8E8',
    }
  },
  2: { // 3rd Place (Bronce)
    bg: 'linear-gradient(45deg, #fff2e6, #e6b89c)',
    shadow: '0 10px 15px #b08d75',
    trophy: {
      p1: '#d35400',
      p2: '#5e2c0f',
      p3: '#f1c40f',
      p4: '#e67e22',
      p5: '#ffe3cc',
    },
    medal: {
      ring1: '#E6A875',
      ring2: '#B87333',
      ring3: '#CD8F5C',
      border1: '#A05A2C',
      border2: '#F0B38A',
    }
  }
};

const PodiumCard = styled.div<{ $rank: number; $idx: number; $isNarrow?: boolean }>`
  position: relative;
  background: none;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  cursor: pointer;
  animation: ${fadeUp} 0.35s ${p => p.$idx * 0.08}s ease both;

  ${p => p.$isNarrow ? css`
    display: flex;
    flex-direction: column;
    transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
    flex: 1;
    min-height: 90px;
    max-height: 240px;

    &:hover {
      flex: 1.8;
      min-height: 200px;
      max-height: 300px;
    }

    &:hover .detailPage {
      display: flex;
    }

    .outlinePage {
      position: relative;
      background: ${RANK_CONFIG[p.$rank]?.bg ?? 'linear-gradient(45deg, #fffbf0, #ffdd87)'};
      width: 100%;
      border-radius: 25px;
      transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
      z-index: 2;
      border: 1px solid rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 18px 24px;
      box-sizing: border-box;
      flex: 1;
      min-height: 90px;
    }

    .detailPage {
      position: relative;
      display: none;
      width: 100%;
      height: 100px;
      background: white;
      z-index: 1;
      border-radius: 0 0 25px 25px;
      overflow: hidden;
      align-items: center;
      justify-content: flex-start;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 10px rgba(0,0,0,0.04);
      margin-top: -16px;
      padding-top: 16px;
    }
  ` : css`
    height: 180px;
    transition-duration: 0.5s;

    &:hover {
      height: 300px;
    }

    &:hover .detailPage {
      display: flex;
    }

    .outlinePage {
      position: relative;
      background: ${RANK_CONFIG[p.$rank]?.bg ?? 'linear-gradient(45deg, #fffbf0, #ffdd87)'};
      width: 100%;
      height: 180px;
      border-radius: 25px;
      transition-duration: 0.5s;
      z-index: 2;
      border: 1px solid rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 18px 24px;
      box-sizing: border-box;
    }

    .detailPage {
      position: relative;
      display: none;
      width: 100%;
      height: 120px;
      background: white;
      top: -20px;
      z-index: 1;
      transition-duration: 1s;
      border-radius: 0 0 25px 25px;
      overflow: hidden;
      align-items: center;
      justify-content: flex-start;
      border: 1px solid rgba(0,0,0,0.06);
      border-top: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.04);
    }
  `}

  &:hover .outlinePage {
    box-shadow: ${p => RANK_CONFIG[p.$rank]?.shadow ?? '0 10px 15px #b1985e'};
  }

  .splitLine {
    width: 70%;
    height: 10px;
    margin: 10px 0;
    align-self: center;
    background-image: linear-gradient(
      to right,
      transparent 10%,
      ${p => RANK_CONFIG[p.$rank]?.trophy.p3}80 20%,
      ${p => RANK_CONFIG[p.$rank]?.trophy.p1} 50%,
      ${p => RANK_CONFIG[p.$rank]?.trophy.p3}80 70%,
      transparent 90%
    );
    z-index: 1;
    flex-shrink: 0;
  }

  .trophy {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    pointer-events: none;
  }

  .topHeader {
    display: flex;
    align-items: flex-end;
    width: 100%;
    padding-right: 95px;
    box-sizing: border-box;
    gap: 12px;
  }

  .ranking_number {
    color: ${p => RANK_CONFIG[p.$rank]?.trophy.p1};
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    font-weight: 700;
    font-size: 80px;
    padding: 0;
    margin: 0;
    line-height: 0.9;
    flex-shrink: 0;
  }

  .ranking_word {
    font-size: 36px;
    color: #424c50;
  }

  .authorRow {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-top: 4px;
    box-sizing: border-box;
  }

  .userAvatar, .userAvatarImg {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .userAvatarImg {
    object-fit: cover;
    border: 1.5px solid rgba(0,0,0,0.08);
  }

  .userName {
    font-weight: 700;
    color: #6b7578;
    font-size: 13.5px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }

  .medals {
    position: absolute;
    top: 15px;
    right: 5px;
  }

  .gradesBox {
    position: relative;
    height: 75px;
    top: 10px;
    margin-right: 10px;
    margin-left: 15px;
  }

  .gradesIcon {
    position: absolute;
    top: 10px;
    left: 0;
  }

  .gradesBoxLabel {
    position: relative;
    display: block;
    margin-left: 60px;
    color: #424c50;
    letter-spacing: 2px;
    font-family: Arial, Helvetica, sans-serif;
    margin-top: 20px;
    font-weight: 800;
    font-size: 11px;
  }

  .gradesBoxNum {
    position: relative;
    font-family: Arial, Helvetica, sans-serif;
    display: block;
    font-size: 24px;
    font-weight: 800;
    margin-left: 60px;
    color: ${p => RANK_CONFIG[p.$rank]?.trophy.p1};
    top: -5px;
  }

  .ideaTitle {
    font-size: 14.5px;
    font-weight: 800;
    color: #424c50;
    margin: 0;
    padding: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-align: left;
    pointer-events: none;
    word-break: break-word;
    overflow-wrap: break-word;
    flex: 1;
  }

  .slide-in-top {
    animation: slide-in-top 0.5s cubic-bezier(0.65, 0.05, 0.36, 1) both;
  }

  @keyframes slide-in-top {
    0% {
      transform: translateY(-50px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const FireSvg = ({ size = 20, className, id = "fireGradient" }: { size?: number; className?: string; id?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={id} x1="12" y1="22" x2="12" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FE410A" />
        <stop offset="0.6" stopColor="#FF8C00" />
        <stop offset="1" stopColor="#FFD700" />
      </linearGradient>
    </defs>
    <path d="M12 2C12 2 12.5 5.5 11 8C9.5 10.5 7 11.5 7 15C7 18.5 9.5 21 12 21C14.5 21 17 18.5 17 15C17 11.5 15.5 8 15.5 8C15.5 8 18 10 19 13C20 16 19 19 19 19C19 19 22 16 21 12C20 8 17.5 5 15.5 3C15.5 3 15 6 13.5 7C12 8 12 2 12 2Z" fill={`url(#${id})`} />
    <path d="M12 21C11 21 9 20 8 18C7 16 7.5 14 8.5 13C9.5 12 11 12 11 12C11 12 10.5 13.5 11 15C11.5 16.5 13 17 13 17C13 17 12 18 12 21Z" fill="#FFF5EB" fillOpacity="0.6" />
  </svg>
);

const StarSvg = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
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
  challengeStatus?: string;
  isNarrow?: boolean;
}

const getRankDisplay = (rank: number) => {
  if (rank === 0) return { num: '1', suffix: 'st' };
  if (rank === 1) return { num: '2', suffix: 'nd' };
  if (rank === 2) return { num: '3', suffix: 'rd' };
  return { num: String(rank + 1), suffix: 'th' };
};

const PodiumSection: React.FC<PodiumSectionProps> = ({ topIdeas, onSelectIdea, challengeStatus, isNarrow }) => {
  const podiumEntries = topIdeas.slice(0, 3);
  const isClosed = challengeStatus === 'CLOSED';

  if (podiumEntries.length === 0) {
    return (
      <Grid $count={1} $isNarrow={isNarrow}>
        <div style={{
          padding: '32px 24px 24px',
          borderRadius: '20px',
          background: 'white',
          border: 'none',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: 700,
          gridColumn: '1 / -1'
        }}>
          Aún no hay ideas en vuelo en este reto
        </div>
      </Grid>
    );
  }

  return (
    <Grid $count={podiumEntries.length} $isNarrow={isNarrow}>
      {podiumEntries.map((idea, i) => {
        const isEvaluated = isClosed || (idea.finalScore !== undefined && idea.finalScore > 0);
        const totalInteractions = (idea.likesCount ?? 0) + (idea.commentsCount ?? 0);
        const authorName = idea.author?.nickname || (idea as any).authorName || (idea as any).authorRealName || (idea.author as any)?.displayName || idea.author?.name || 'Participante';
        const rankInfo = getRankDisplay(i);
        const config = RANK_CONFIG[i] || RANK_CONFIG[0];
        const medal = config.medal;
        const trophyColors = config.trophy;

        return (
          <PodiumCard
            key={idea.id}
            $rank={i}
            $idx={i}
            $isNarrow={isNarrow}
            onClick={() => onSelectIdea?.(idea)}
          >
            <div className="outlinePage">
              <svg className="icon trophy" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={120} height={120}>
                <path d="M469.333333 682.666667h85.333334v128h-85.333334zM435.2 810.666667h153.6c4.693333 0 8.533333 3.84 8.533333 8.533333v34.133333h-170.666666v-34.133333c0-4.693333 3.84-8.533333 8.533333-8.533333z" fill={trophyColors.p1} />
                <path d="M384 853.333333h256a42.666667 42.666667 0 0 1 42.666667 42.666667v42.666667H341.333333v-42.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z" fill={trophyColors.p2} />
                <path d="M213.333333 256v85.333333a42.666667 42.666667 0 0 0 85.333334 0V256H213.333333zM170.666667 213.333333h170.666666v128a85.333333 85.333333 0 1 1-170.666666 0V213.333333zM725.333333 256v85.333333a42.666667 42.666667 0 0 0 85.333334 0V256h-85.333334z m-42.666666-42.666667h170.666666v128a85.333333 85.333333 0 1 1-170.666666 0V213.333333z" fill={trophyColors.p3} />
                <path d="M298.666667 85.333333h426.666666a42.666667 42.666667 0 0 1 42.666667 42.666667v341.333333a256 256 0 1 1-512 0V128a42.666667 42.666667 0 0 1 42.666667-42.666667z" fill={trophyColors.p4} />
                <path d="M512 469.333333l-100.309333 52.736 19.157333-111.701333-81.152-79.104 112.128-16.298667L512 213.333333l50.176 101.632 112.128 16.298667-81.152 79.104 19.157333 111.701333z" fill={trophyColors.p5} />
              </svg>

              <div className="topHeader">
                <p className="ranking_number">{rankInfo.num}<span className="ranking_word">{rankInfo.suffix}</span></p>
                <p className="ideaTitle">{idea.title}</p>
              </div>

              <div className="splitLine" />

              <div className="authorRow">
                {idea.author?.avatar ? (
                  <img className="userAvatarImg" src={idea.author.avatar} alt={authorName} />
                ) : (
                  <svg className="userAvatar" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={25} height={25}>
                    <path d="M512 0C228.693 0 0 228.693 0 512s228.693 512 512 512 512-228.693 512-512S795.307 0 512 0z m0 69.973c244.053 0 442.027 197.973 442.027 442.027 0 87.04-25.6 168.96-69.973 237.227-73.387-78.507-170.667-133.12-281.6-151.893 69.973-34.133 119.467-105.813 119.467-187.733 0-116.053-93.867-209.92-209.92-209.92s-209.92 93.867-209.92 209.92c0 83.627 47.787 155.307 119.467 187.733-110.933 20.48-208.213 75.093-281.6 153.6-44.373-68.267-69.973-150.187-69.973-238.933 0-244.053 197.973-442.027 442.027-442.027z" fill="#8a8a8a" />
                  </svg>
                )}
                <span className="userName">{authorName}</span>
              </div>
            </div>
            
            <div className="detailPage">
              <svg className="icon medals slide-in-top" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width={80} height={80}>
                <path d="M896 42.666667h-128l-170.666667 213.333333h128z" fill="#FF4C4C" />
                <path d="M768 42.666667h-128l-170.666667 213.333333h128z" fill="#3B8CFF" />
                <path d="M640 42.666667h-128L341.333333 256h128z" fill="#F1F1F1" />
                <path d="M128 42.666667h128l170.666667 213.333333H298.666667z" fill="#FF4C4C" />
                <path d="M256 42.666667h128l170.666667 213.333333h-128z" fill="#3B8CFF" />
                <path d="M384 42.666667h128l170.666667 213.333333h-128z" fill="#FBFBFB" />
                <path d="M298.666667 256h426.666666v213.333333H298.666667z" fill={medal.border1} />
                <path d="M512 661.333333m-320 0a320 320 0 1 0 640 0 320 320 0 1 0-640 0Z" fill={medal.ring1} />
                <path d="M512 661.333333m-256 0a256 256 0 1 0 512 0 256 256 0 1 0-512 0Z" fill={medal.ring2} />
                <path d="M512 661.333333m-213.333333 0a213.333333 213.333333 0 1 0 426.666666 0 213.333333 213.333333 0 1 0-426.666666 0Z" fill={medal.ring3} />
                <path d="M277.333333 256h469.333334a21.333333 21.333333 0 0 1 0 42.666667h-469.333334a21.333333 21.333333 0 0 1 0-42.666667z" fill={medal.border1} />
                <path d="M277.333333 264.533333a12.8 12.8 0 1 0 0 25.6h469.333334a12.8 12.8 0 1 0 0-25.6h-469.333334z m0-17.066666h469.333334a29.866667 29.866667 0 1 1 0 59.733333h-469.333334a29.866667 29.866667 0 1 1 0-59.733333z" fill={medal.border2} />
                <path d="M512 746.666667l-100.309333 52.736 19.157333-111.701334-81.152-79.104 112.128-16.298666L512 490.666667l50.176 101.632 112.128 16.298666-81.152 79.104 19.157333 111.701334z" fill="#FFF2A0" />
              </svg>

              <div className="gradesBox">
                {isEvaluated ? (
                  <StarSvg size={44} className="gradesIcon" />
                ) : (
                  <FireSvg size={44} className="gradesIcon" id={`fireGradient-${idea.id}`} />
                )}
                <p className="gradesBoxLabel">{isEvaluated ? 'CALIFICACIÓN' : 'ON FIRE'}</p>
                <p className="gradesBoxNum">
                  {isEvaluated ? (idea.finalScore !== undefined && idea.finalScore > 0 ? idea.finalScore.toFixed(1) : '0.0') : totalInteractions}
                </p>
              </div>
            </div>
          </PodiumCard>
        );
      })}
    </Grid>
  );
};

export default PodiumSection;
