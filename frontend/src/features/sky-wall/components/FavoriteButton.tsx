import { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { useAuth } from '../../../context/AuthContext';
import { ideaService } from '../../../services/idea.service';
import { toast } from 'sonner';
import { wallEvents } from '../../../hooks/useWallEvents';

const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.18); }
  70%  { transform: scale(0.93); }
  100% { transform: scale(1); }
`;

const Button = styled.button<{ $isFavorite: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: ${(p) => (p.$isFavorite ? `${Pista8Theme.primary}12` : 'rgba(248,249,250,0.9)')};
  color: ${(p) => (p.$isFavorite ? Pista8Theme.primary : '#94a3b8')};
  border: 1.5px solid ${(p) => (p.$isFavorite ? `${Pista8Theme.primary}50` : 'rgba(72,80,84,0.1)')};
  border-radius: 99px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: ${(p) => (p.$isFavorite ? `0 0 0 3px ${Pista8Theme.primary}18` : 'none')};

  svg {
    transition: transform 0.18s, fill 0.18s;
    ${(p) => p.$isFavorite && css`animation: ${pop} 0.35s cubic-bezier(.36,.07,.19,.97) both;`}
  }

  &:hover:not(:disabled) {
    background: ${(p) => (!p.$isFavorite ? `${Pista8Theme.primary}08` : `${Pista8Theme.primary}16`)};
    border-color: ${(p) => (!p.$isFavorite ? `${Pista8Theme.primary}40` : `${Pista8Theme.primary}66`)};
    color: ${Pista8Theme.primary};
  }
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;

  &:hover .custom-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const TooltipText = styled.span`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: rgba(26, 31, 34, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(26, 31, 34, 0.95) transparent transparent transparent;
  }
`;

interface FavoriteButtonProps {
  ideaId: string;
  hasFavorited?: boolean;
  disabled?: boolean;
}

export const FavoriteButton = ({ ideaId, hasFavorited, disabled }: FavoriteButtonProps) => {
  const { userProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(Boolean(hasFavorited));
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsFavorite(Boolean(hasFavorited));
  }, [hasFavorited, ideaId]);

  const handleToggleFavorite = async () => {
    if (!userProfile) {
      toast.info('Inicia sesión para guardar favoritos.');
      return;
    }

    if (isUpdating || disabled) return;

    const nextFavoriteState = !isFavorite;
    setIsFavorite(nextFavoriteState);
    setIsUpdating(true);
    wallEvents.emit('favorite_changed', { ideaId, isFavorite: nextFavoriteState });

    try {
      await ideaService.favoriteIdea(ideaId);
    } catch {
      setIsFavorite(!nextFavoriteState);
      wallEvents.emit('favorite_changed', { ideaId, isFavorite: !nextFavoriteState });
      toast.error('No pudimos actualizar tu favorito. Intenta de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TooltipContainer>
      <Button
        $isFavorite={isFavorite}
        onClick={handleToggleFavorite}
        type="button"
        aria-label="Marcar como favorito"
        disabled={isUpdating || disabled}
        style={disabled ? { cursor: 'not-allowed', opacity: 0.5, filter: 'grayscale(1)' } : {}}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isFavorite ? Pista8Theme.primary : 'none'}
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </Button>
      <TooltipText className="custom-tooltip">
        {disabled ? 'Fase de evaluación técnica' : isFavorite ? 'Marcado' : 'Guardar'}
      </TooltipText>
    </TooltipContainer>
  );
};

export default FavoriteButton;
