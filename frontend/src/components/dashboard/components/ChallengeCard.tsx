import React from 'react';
import * as S from '../styles/ChallengeStyles';

interface ChallengeCardProps {
  challenge: any;
  active: boolean;
  onSelect: () => void;
  onRespond: (e: React.MouseEvent) => void;
}

const getRemainingText = (endDateStr?: string): { text: string; urgent: boolean } | null => {
  if (!endDateStr) return null;
  const end = new Date(endDateStr).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 1) return { text: `Cierra en ${days} días`, urgent: false };
  if (days === 1) return { text: 'Cierra mañana', urgent: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return { text: `Cierra en ${hours}h`, urgent: true };

  const minutes = Math.floor(diff / (1000 * 60));
  return { text: `Cierra en ${minutes} min`, urgent: true };
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, active, onSelect, onRespond }) => {
  const isExpired = challenge.endDate ? new Date() > new Date(challenge.endDate) : false;
  const remaining = !isExpired ? getRemainingText(challenge.endDate) : null;

  return (
    <S.ChallengeCard active={active} onClick={onSelect}>
      {active && <S.ActiveBar />}

      <S.CardTopRow>
        {/* Logo + Category left side */}
        <S.CardTopLeft>
          {challenge.logoUrl && (
            <S.CardLogoWrap>
              <S.CardLogo src={challenge.logoUrl} alt={challenge.title} />
            </S.CardLogoWrap>
          )}
          {challenge.category && <S.CategoryTag>{challenge.category}</S.CategoryTag>}
        </S.CardTopLeft>

        {/* Badge right side */}
        {isExpired
          ? <S.StatusBadge expired>Expirado</S.StatusBadge>
          : challenge.badge && <S.StatusBadge>{challenge.badge}</S.StatusBadge>
        }
      </S.CardTopRow>

      <S.CardTitle>{challenge.title}</S.CardTitle>

      <S.CardMeta>
        <span>{challenge.ideasCount || 0} ideas enviadas</span>
        {remaining && (
          <>
            <S.MetaDot />
            <S.ClosingBadge urgent={remaining.urgent}>{remaining.text}</S.ClosingBadge>
          </>
        )}
      </S.CardMeta>

      <S.CardBottomRow>
        <S.StatsRow>
          <S.StatChip title="Likes totales">
            <svg width="13" height="13" viewBox="0 0 24 24" fill={`rgba(72,80,84,0.4)`}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {challenge.likesCount || 0}
          </S.StatChip>
          <S.StatChip title="Comentarios">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(72,80,84,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {challenge.commentsCount || 0}
          </S.StatChip>
        </S.StatsRow>

        <S.RespondButton
          type="button"
          onClick={isExpired ? undefined : onRespond}
          disabled={isExpired}
        >
          {isExpired ? 'Finalizado' : 'Responder'}
          {!isExpired && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </S.RespondButton>
      </S.CardBottomRow>
    </S.ChallengeCard>
  );
};

export default ChallengeCard;