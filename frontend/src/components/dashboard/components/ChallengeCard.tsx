import React from 'react';
import * as S from '../styles/ChallengeStyles';

interface ChallengeCardProps {
  challenge: any;
  active: boolean;
  onSelect: () => void;
  onRespond: (e: React.MouseEvent) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, active, onSelect, onRespond }) => {
  const isExpired = challenge.endDate ? new Date() > new Date(challenge.endDate) : false;

  return (
    <S.ChallengeCard $active={active} onClick={onSelect}>
      {active && <S.ActiveBar />}
      <S.TopRight>
        {isExpired ? (
          <S.BadgeCorner style={{ background: '#e53e3e' }}>EXPIRADO</S.BadgeCorner>
        ) : (
          challenge.badge && <S.BadgeCorner>{challenge.badge}</S.BadgeCorner>
        )}
        <S.LikesChip>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {challenge.likesCount || 0}
        </S.LikesChip>
      </S.TopRight>
      <S.CardTop>
        <S.CategoryTag>{challenge.category}</S.CategoryTag>
      </S.CardTop>
      <S.CardTitle>{challenge.title}</S.CardTitle>
      <S.CardMeta>{challenge.ideasCount || 0} ideas enviadas</S.CardMeta>
      <S.CardActionRow>
        <S.RespondButton 
          type="button" 
          onClick={isExpired ? undefined : onRespond}
          style={isExpired ? { opacity: 0.5, cursor: 'not-allowed', background: '#ccc' } : {}}
          disabled={isExpired}
        >
          {isExpired ? 'Reto Finalizado' : 'Responder reto'} <span>{'>'}</span>
        </S.RespondButton>
      </S.CardActionRow>
    </S.ChallengeCard>
  );
};

export default ChallengeCard;
