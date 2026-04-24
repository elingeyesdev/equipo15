import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { ideaService } from '../../../services/idea.service';
import { toast } from 'sonner';
import type { AxiosLikeError } from '../types';
import { useAuth } from '../../../context/AuthContext';

const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.22); }
  70%  { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const Button = styled.button<{ $hasVoted: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${p => p.$hasVoted ? `${Pista8Theme.primary}12` : 'rgba(248,249,250,0.9)'};
  color: ${p => p.$hasVoted ? Pista8Theme.primary : '#94a3b8'};
  border: 1.5px solid ${p => p.$hasVoted ? `${Pista8Theme.primary}50` : 'rgba(72,80,84,0.1)'};
  border-radius: 99px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: ${p => p.$hasVoted ? `0 0 0 3px ${Pista8Theme.primary}18` : 'none'};
  opacity: 1;

  svg {
    transition: transform 0.18s, fill 0.18s;
    ${p => p.$hasVoted && css`animation: ${pop} 0.35s cubic-bezier(.36,.07,.19,.97) both;`}
  }

  &:hover:not(:disabled) {
    background: ${p => !p.$hasVoted ? `${Pista8Theme.primary}08` : ''};
    border-color: ${p => !p.$hasVoted ? `${Pista8Theme.primary}40` : ''};
    color: ${p => !p.$hasVoted ? Pista8Theme.primary : ''};
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

const Count = styled.span<{ $hasVoted: boolean }>`
  font-size: 14px;
  font-weight: 900;
  color: ${p => p.$hasVoted ? Pista8Theme.primary : '#a8b0b8'};
  letter-spacing: -0.02em;
  transition: color 0.2s;
`;

interface LikeButtonProps {
  ideaId: string;
  initialLikes: number;
  hasVoted?: boolean;
  isAuthor?: boolean;
}

const getLocalVoted = (id: string, userId?: string) => {
  try {
    const key = userId ? `pista8_voted_ideas_${userId}` : 'pista8_voted_ideas';
    const votedIdeas = JSON.parse(localStorage.getItem(key) || '[]');
    return votedIdeas.includes(id);
  } catch {
    return false;
  }
};

const saveLocalVoted = (id: string, userId?: string) => {
  try {
    const key = userId ? `pista8_voted_ideas_${userId}` : 'pista8_voted_ideas';
    const votedIdeas = JSON.parse(localStorage.getItem(key) || '[]');
    if (!votedIdeas.includes(id)) {
      votedIdeas.push(id);
    }
    localStorage.setItem(key, JSON.stringify(votedIdeas));
  } catch { }
};

const removeLocalVoted = (id: string, userId?: string) => {
  try {
    const key = userId ? `pista8_voted_ideas_${userId}` : 'pista8_voted_ideas';
    const votedIdeas = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedIdeas = votedIdeas.filter((votedId: string) => votedId !== id);
    localStorage.setItem(key, JSON.stringify(updatedIdeas));
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

export const LikeButton = ({ ideaId, initialLikes, hasVoted: serverVoted, isAuthor }: LikeButtonProps) => {
  const { userProfile } = useAuth();
  const currentUserId = userProfile?.id;
  const [likes, setLikes] = useState(initialLikes);
  const [hasVoted, setHasVoted] = useState(() => serverVoted || getLocalVoted(ideaId, currentUserId));

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    if (serverVoted) {
      setHasVoted(true);
      saveLocalVoted(ideaId, currentUserId);
    }
  }, [serverVoted, ideaId, currentUserId]);

  useEffect(() => {
    setHasVoted(serverVoted || getLocalVoted(ideaId, currentUserId));
  }, [currentUserId, ideaId, serverVoted]);

  const handleVote = () => {
    if (userProfile?.status === 'SOFT_BLOCK') {
      toast.error('Tu capacidad de votar ha sido pausada temporalmente.');
      return;
    }

    if (isAuthor) {
      toast.info('No puedes votar por tu propia idea.');
      return;
    }

    const nextVotedState = !hasVoted;
    setHasVoted(nextVotedState);
    let nextLikes = likes;

    if (nextVotedState) {
      setLikes(prev => {
        nextLikes = prev + 1;
        saveLocalVoted(ideaId, currentUserId);
        window.dispatchEvent(new CustomEvent('pista8:vote_changed', { detail: { ideaId, hasVoted: true, likesCount: nextLikes } }));
        return nextLikes;
      });
    } else {
      setLikes(prev => {
        nextLikes = Math.max(0, prev - 1);
        removeLocalVoted(ideaId, currentUserId);
        window.dispatchEvent(new CustomEvent('pista8:vote_changed', { detail: { ideaId, hasVoted: false, likesCount: nextLikes } }));
        return nextLikes;
      });
    }

    ideaService.voteIdea(ideaId).catch((error: unknown) => {
      if (isForbiddenError(error)) {
        const msg = (error as any)?.response?.data?.message || 'No puedes votar por tu propia idea.';
        toast.error(msg);
      } else if (!isConflictError(error)) {
        toast.error('No pudimos procesar tu acción. Intenta de nuevo.');
      }
      setHasVoted(!nextVotedState);
      if (!nextVotedState) {
        setLikes(prev => {
          const revertedLikes = prev + 1;
          saveLocalVoted(ideaId, currentUserId);
          window.dispatchEvent(new CustomEvent('pista8:vote_changed', { detail: { ideaId, hasVoted: true, likesCount: revertedLikes } }));
          return revertedLikes;
        });
      } else {
        setLikes(prev => {
          const revertedLikes = Math.max(0, prev - 1);
          removeLocalVoted(ideaId, currentUserId);
          window.dispatchEvent(new CustomEvent('pista8:vote_changed', { detail: { ideaId, hasVoted: false, likesCount: revertedLikes } }));
          return revertedLikes;
        });
      }
    });
  };

  const isSoftBlocked = userProfile?.status === 'SOFT_BLOCK';

  const tooltipMessage = isSoftBlocked
    ? 'Acción pausada temporalmente'
    : isAuthor
      ? 'No puedes votar por tu propia idea'
      : hasVoted
        ? 'Quitar voto'
        : 'Apoyar idea';

  return (
    <TooltipContainer>
      <Button
        $hasVoted={hasVoted}
        onClick={handleVote}
        style={
          isSoftBlocked ? { cursor: 'not-allowed', opacity: 0.5, filter: 'grayscale(1)' } 
          : isAuthor ? { cursor: 'help', opacity: 0.8 } 
          : {}
        }
      >
        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          fill={hasVoted && !isSoftBlocked ? Pista8Theme.primary : 'none'}
          style={{ color: hasVoted && !isSoftBlocked ? Pista8Theme.primary : 'currentColor' }}
        >
          {isSoftBlocked ? (
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          ) : (
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          )}
          {isSoftBlocked && (
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          )}
        </svg>
        <Count $hasVoted={hasVoted && !isSoftBlocked}>{likes}</Count>
      </Button>
      <TooltipText className="custom-tooltip">{tooltipMessage}</TooltipText>
    </TooltipContainer>
  );
};

export default LikeButton;