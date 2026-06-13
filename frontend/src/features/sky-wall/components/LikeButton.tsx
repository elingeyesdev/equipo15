import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { ideaService } from '../../../services/idea.service';
import { toast } from 'sonner';
import type { AxiosLikeError } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { wallEvents } from '../../../hooks/useWallEvents';
import { Sparkles, Lightbulb, Flame, Brain } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.22); }
  70%  { transform: scale(0.92); }
  100% { transform: scale(1); }
`;



const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const ReactionsBar = styled.div<{ $open: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) ${p => p.$open ? 'translateY(0)' : 'translateY(10px)'};
  background: ${Pista8Theme.white};
  border-radius: 99px;
  padding: 6px;
  display: flex;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(72, 80, 84, 0.08);
  opacity: ${p => p.$open ? 1 : 0};
  visibility: ${p => p.$open ? 'visible' : 'hidden'};
  pointer-events: ${p => p.$open ? 'auto' : 'none'};
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 50;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: ${Pista8Theme.white} transparent transparent transparent;
  }
`;

const ReactionOption = styled.button<{ $color: string }>`
  background: ${Pista8Theme.background};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: scale(1.15) translateY(-2px);
    background: ${p => p.$color}15;
    color: ${p => p.$color};
  }

  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const Tooltip = styled.div`
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
    margin-left: -4px;
    border-width: 4px;
    border-style: solid;
    border-color: rgba(26, 31, 34, 0.95) transparent transparent transparent;
  }
`;

const MainButton = styled.button<{ $hasVoted: boolean; $activeColor?: string }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${p => p.$hasVoted ? (p.$activeColor ? p.$activeColor + '15' : `${Pista8Theme.primary}12`) : 'rgba(248,249,250,0.9)'};
  color: ${p => p.$hasVoted ? (p.$activeColor || Pista8Theme.primary) : '#94a3b8'};
  border: 1.5px solid ${p => p.$hasVoted ? (p.$activeColor ? p.$activeColor + '40' : `${Pista8Theme.primary}50`) : 'rgba(72,80,84,0.1)'};
  border-radius: 99px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${p => p.$hasVoted ? `0 0 0 3px ${p.$activeColor ? p.$activeColor + '18' : Pista8Theme.primary + '18'}` : 'none'};

  svg {
    transition: transform 0.18s, fill 0.18s;
    ${p => p.$hasVoted && css`animation: ${pop} 0.35s cubic-bezier(.36,.07,.19,.97) both;`}
  }

  &:hover:not(:disabled) {
    background: ${p => !p.$hasVoted ? `${Pista8Theme.primary}08` : ''};
    border-color: ${p => !p.$hasVoted ? `${Pista8Theme.primary}40` : ''};
    color: ${p => !p.$hasVoted ? Pista8Theme.primary : ''};
  }

  &:hover .main-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const MainTooltip = styled(Tooltip)`
  bottom: auto;
  top: calc(100% + 12px);
  transform: translateX(-50%) translateY(-4px);

  &::after {
    top: auto;
    bottom: 100%;
    margin-left: -4px;
    border-color: transparent transparent rgba(26, 31, 34, 0.95) transparent;
  }
`;

const Count = styled.span<{ $hasVoted: boolean; $activeColor?: string }>`
  font-size: 14px;
  font-weight: 900;
  color: ${p => p.$hasVoted ? (p.$activeColor || Pista8Theme.primary) : '#a8b0b8'};
  letter-spacing: -0.02em;
  transition: color 0.2s;
`;

interface LikeButtonProps {
  ideaId: string;
  initialLikes: number;
  hasVoted?: boolean;
  isAuthor?: boolean;
  disabled?: boolean;
}

const getLocalReaction = (id: string, userId?: string) => {
  try {
    const key = userId ? `pista8_reactions_${userId}` : 'pista8_reactions';
    const reactions = JSON.parse(localStorage.getItem(key) || '{}');
    return reactions[id] || null;
  } catch {
    return null;
  }
};

const saveLocalReaction = (id: string, reactionType: string, userId?: string) => {
  try {
    const key = userId ? `pista8_reactions_${userId}` : 'pista8_reactions';
    const reactions = JSON.parse(localStorage.getItem(key) || '{}');
    reactions[id] = reactionType;
    localStorage.setItem(key, JSON.stringify(reactions));
  } catch { }
};

const removeLocalReaction = (id: string, userId?: string) => {
  try {
    const key = userId ? `pista8_reactions_${userId}` : 'pista8_reactions';
    const reactions = JSON.parse(localStorage.getItem(key) || '{}');
    delete reactions[id];
    localStorage.setItem(key, JSON.stringify(reactions));
  } catch { }
};

const isConflictError = (error: unknown): boolean => {
  const axiosError = error as AxiosLikeError;
  return axiosError?.response?.status === 409;
};

const isForbiddenError = (error: unknown): boolean => {
  const axiosError = error as any;
  return axiosError?.response?.status === 403 || axiosError?.response?.data?.code === 'AUTOLIKE_FORBIDDEN';
};

const REACTION_CONFIG = {
  good: { icon: Lightbulb, color: '#f59e0b', label: 'Buena idea', tooltip: 'Me interesa, esta propuesta resuelve algo real.' },
  future: { icon: Flame, color: '#ef4444', label: 'Tiene futuro', tooltip: 'Veo mucho potencial estratégico en esta idea.' },
  complex: { icon: Brain, color: '#64748b', label: 'Complicado', tooltip: 'Interesante, pero parece difícil de implementar.' }
} as const;

export const LikeButton = ({ ideaId, initialLikes, hasVoted: serverVoted, isAuthor, disabled }: LikeButtonProps) => {
  const { userProfile } = useAuth();
  const currentUserId = userProfile?.id;
  const [likes, setLikes] = useState(initialLikes);
  const [reaction, setReaction] = useState<string | null>(() => getLocalReaction(ideaId, currentUserId));
  const [hasVoted, setHasVoted] = useState(() => serverVoted || !!reaction);
  const [reactionsOpen, setReactionsOpen] = useState(false);

  // Cierra el menú al hacer clic fuera del contenedor
  const handleClickOutside = useCallback(() => setReactionsOpen(false), []);
  const containerRef = useClickOutside<HTMLDivElement>(handleClickOutside, reactionsOpen);

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    if (serverVoted) {
      setHasVoted(true);
      if (!reaction) {
        setReaction('good');
        saveLocalReaction(ideaId, 'good', currentUserId);
      }
    } else {
      setHasVoted(false);
      setReaction(null);
      removeLocalReaction(ideaId, currentUserId);
    }
  }, [serverVoted, ideaId, currentUserId]);

  const executeVote = (targetReaction: string | null) => {
    const isReadOnlyPenalty = userProfile?.status === 'SOFT_BLOCK' || userProfile?.status === 'SUSPENDED';

    if (disabled) return;
    if (isReadOnlyPenalty) {
      toast.error('Tu cuenta está en modo solo lectura durante la sanción.');
      return;
    }
    if (isAuthor) {
      toast.info('No puedes votar por tu propia idea.');
      return;
    }

    const isVoting = targetReaction !== null;
    const prevVoted = hasVoted;
    const prevReaction = reaction;
    const prevLikes = likes;

    setHasVoted(isVoting);
    setReaction(targetReaction);

    let nextLikes = likes;

    if (isVoting && !prevVoted) {
      nextLikes = likes + 1;
      saveLocalReaction(ideaId, targetReaction, currentUserId);
    } else if (!isVoting && prevVoted) {
      nextLikes = Math.max(0, likes - 1);
      removeLocalReaction(ideaId, currentUserId);
    } else if (isVoting && prevVoted) {
      saveLocalReaction(ideaId, targetReaction, currentUserId);
    }

    setLikes(nextLikes);
    wallEvents.emit('vote_changed', { ideaId, hasVoted: isVoting, likesCount: nextLikes });

    if (isVoting !== prevVoted || targetReaction !== prevReaction) {
      ideaService.voteIdea(ideaId, targetReaction).catch((error: unknown) => {
        if (isForbiddenError(error)) {
          const msg = (error as any)?.response?.data?.message || 'No puedes votar por tu propia idea.';
          toast.error(msg);
        } else if (!isConflictError(error)) {
          toast.error('No pudimos procesar tu acción. Intenta de nuevo.');
        }
        
        setHasVoted(prevVoted);
        setReaction(prevReaction);
        setLikes(prevLikes);
        if (prevVoted && prevReaction) saveLocalReaction(ideaId, prevReaction, currentUserId);
        else removeLocalReaction(ideaId, currentUserId);
        wallEvents.emit('vote_changed', { ideaId, hasVoted: prevVoted, likesCount: prevLikes });
      });
    }
  };

  const handleToggle = () => {
    if (disabled || isSoftBlocked || isAuthor) return;
    // Si el menú está abierto, lo cierra; si no, lo abre para elegir reacción
    setReactionsOpen(prev => !prev);
  };

  const isSoftBlocked = userProfile?.status === 'SOFT_BLOCK' || userProfile?.status === 'SUSPENDED';

  const tooltipMessage = disabled
    ? 'Fase de evaluación técnica'
    : isSoftBlocked
      ? 'Cuenta en modo solo lectura'
      : isAuthor
        ? 'Como autor, no puedes votar por tu propia idea'
        : hasVoted
          ? 'Quitar reacción'
          : 'Haz clic aquí para dar tu chispa de feedback';

  const activeConfig = reaction ? REACTION_CONFIG[reaction as keyof typeof REACTION_CONFIG] : undefined;
  const ActiveIcon = activeConfig?.icon || Sparkles;
  const activeColor = activeConfig?.color;

  return (
    <Container ref={containerRef}>
      {!disabled && !isAuthor && !isSoftBlocked && (
        <ReactionsBar $open={reactionsOpen}>
          {(Object.entries(REACTION_CONFIG) as [keyof typeof REACTION_CONFIG, typeof REACTION_CONFIG['good']][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <ReactionOption 
                key={key} 
                $color={config.color}
                onClick={(e) => {
                  e.stopPropagation();
                  setReactionsOpen(false);
                  executeVote(key);
                }}
              >
                <Icon size={18} strokeWidth={2.5} />
                <Tooltip className="tooltip">{config.tooltip}</Tooltip>
              </ReactionOption>
            );
          })}
        </ReactionsBar>
      )}

      <MainButton
        $hasVoted={hasVoted}
        $activeColor={activeColor}
        onClick={handleToggle}
        disabled={disabled}
        style={
          disabled ? { cursor: 'not-allowed', opacity: 0.5, filter: 'grayscale(1)' }
          : isSoftBlocked ? { cursor: 'not-allowed', opacity: 0.5, filter: 'grayscale(1)' } 
          : isAuthor ? { cursor: 'help', opacity: 0.8 } 
          : {}
        }
      >
        <MainTooltip className="main-tooltip">{tooltipMessage}</MainTooltip>
        <ActiveIcon 
          size={16} 
          strokeWidth={2.5} 
          color={hasVoted && !isSoftBlocked && activeColor ? activeColor : 'currentColor'}
          fill={hasVoted && !isSoftBlocked && activeColor ? activeColor : 'none'}
        />
        <Count $hasVoted={hasVoted && !isSoftBlocked} $activeColor={activeColor}>
          {likes}
        </Count>
      </MainButton>
    </Container>
  );
};

export default LikeButton;
