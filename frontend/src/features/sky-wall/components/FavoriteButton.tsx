import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../context/AuthContext';
import { ideaService } from '../../../services/idea.service';
import { toast } from 'sonner';
import { wallEvents } from '../../../hooks/useWallEvents';

import AnimatedBookmark from '../../../components/AnimatedBookmark';

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
      <AnimatedBookmark
        checked={isFavorite}
        onChange={handleToggleFavorite}
        disabled={isUpdating || disabled}
      />
      <TooltipText className="custom-tooltip">
        {disabled ? 'Fase de evaluación técnica' : isFavorite ? 'Marcado' : 'Guardar'}
      </TooltipText>
    </TooltipContainer>
  );
};

export default FavoriteButton;
