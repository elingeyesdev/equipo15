import React, { useEffect, useState } from 'react';
import * as S from '../styles/ChallengeStyles';
import { Sparkles } from 'lucide-react';

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
  const [commentsCount, setCommentsCount] = useState(challenge.commentsCount || 0);
  const closeDate = challenge.endDate || challenge.submissionsCloseAt;
  const isExpired = closeDate ? new Date() > new Date(closeDate) : false;
  const remaining = !isExpired ? getRemainingText(closeDate) : null;

  useEffect(() => {
    setCommentsCount(challenge.commentsCount || 0);
  }, [challenge.commentsCount]);

  return (
    <S.ChallengeCard $active={active} onClick={() => onSelect()} role="button">
      {active && <S.ActiveBar />}

      <S.CardTopRow>
        <S.CardTopLeft>
          {challenge.logoUrl && (
            <S.CardLogoWrap>
              <S.CardLogo src={challenge.logoUrl} alt={challenge.title} />
            </S.CardLogoWrap>
          )}
          {challenge.category && <S.CategoryTag>{challenge.category}</S.CategoryTag>}
        </S.CardTopLeft>

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
            <S.ClosingBadge $urgent={remaining.urgent}>{remaining.text}</S.ClosingBadge>
          </>
        )}
      </S.CardMeta>

      <S.CardBottomRow>
        <S.StatsRow>
          <S.StatChip $tooltipText="Interacciones totales">
            <Sparkles size={13} color="rgba(72,80,84,0.4)" />
            {challenge.likesCount || 0}
          </S.StatChip>
          <S.StatChip $tooltipText="Comentarios">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(72,80,84,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {commentsCount}
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
