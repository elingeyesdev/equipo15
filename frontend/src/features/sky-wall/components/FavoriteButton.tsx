import { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { useAuth } from '../../../context/AuthContext';
import { ideaService } from '../../../services/idea.service';
import { toast } from 'sonner';

const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.18); }
  70%  { transform: scale(0.93); }
  100% { transform: scale(1); }
`;

const Button = styled.button<{ $isFavorite: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(p) => (p.$isFavorite ? `${Pista8Theme.primary}12` : 'rgba(248,249,250,0.9)')};
  color: ${(p) => (p.$isFavorite ? Pista8Theme.primary : '#94a3b8')};
  border: 1.5px solid ${(p) => (p.$isFavorite ? `${Pista8Theme.primary}50` : 'rgba(72,80,84,0.1)')};
  border-radius: 99px;
  padding: 10px 18px;
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

interface FavoriteButtonProps {
  ideaId: string;
  hasFavorited?: boolean;
}

export const FavoriteButton = ({ ideaId, hasFavorited }: FavoriteButtonProps) => {
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

    if (isUpdating) return;

    const nextFavoriteState = !isFavorite;
    setIsFavorite(nextFavoriteState);
    setIsUpdating(true);
    window.dispatchEvent(
      new CustomEvent('pista8:favorite_changed', {
        detail: { ideaId, isFavorite: nextFavoriteState },
      }),
    );

    try {
      await ideaService.favoriteIdea(ideaId);
    } catch {
      setIsFavorite(!nextFavoriteState);
      window.dispatchEvent(
        new CustomEvent('pista8:favorite_changed', {
          detail: { ideaId, isFavorite: !nextFavoriteState },
        }),
      );
      toast.error('No pudimos actualizar tu favorito. Intenta de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      $isFavorite={isFavorite}
      onClick={handleToggleFavorite}
      type="button"
      aria-label="Marcar como favorito"
      disabled={isUpdating}
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
        <polygon points="12 2 15.4 8.9 23 10 17.5 15.2 18.8 22.8 12 19.2 5.2 22.8 6.5 15.2 1 10 8.6 8.9 12 2" />
      </svg>
      {isFavorite ? 'Favorito' : 'Guardar'}
    </Button>
  );
};

export default FavoriteButton;
