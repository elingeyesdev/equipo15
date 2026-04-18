import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';
import { ideaService } from '../../../services/idea.service';
import { toast } from 'sonner';

const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.22); }
  70%  { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const Button = styled.button<{ $hasVoted: boolean; $isVoting: boolean }>`
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
  cursor: ${p => p.$isVoting || p.$hasVoted ? 'default' : 'pointer'};
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: ${p => p.$hasVoted ? `0 0 0 3px ${Pista8Theme.primary}18` : 'none'};
  opacity: ${p => p.$isVoting ? 0.6 : 1};

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
}

const getInitialVoted = (id: string) => {
  try {
    const votedIdeas = JSON.parse(localStorage.getItem('pista8_voted_ideas') || '[]');
    return votedIdeas.includes(id);
  } catch {
    return false;
  }
};

const saveVoted = (id: string) => {
  try {
    const votedIdeas = JSON.parse(localStorage.getItem('pista8_voted_ideas') || '[]');
    if (!votedIdeas.includes(id)) {
      votedIdeas.push(id);
      localStorage.setItem('pista8_voted_ideas', JSON.stringify(votedIdeas));
    }
  } catch {}
};

export const LikeButton = ({ ideaId, initialLikes }: LikeButtonProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [hasVoted, setHasVoted] = useState(() => getInitialVoted(ideaId));
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (hasVoted || isVoting) {
      if (hasVoted) toast.error('Ya apoyaste este avión');
      return;
    }
    setIsVoting(true);
    try {
      await ideaService.voteIdea(ideaId);
      setHasVoted(true);
      saveVoted(ideaId);
      setLikes(prev => prev + 1);
      toast.success('Voto registrado');
    } catch {
      toast.error('Hubo un error al registrar tu voto.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Button $hasVoted={hasVoted} $isVoting={isVoting} onClick={handleVote} disabled={isVoting || hasVoted}>
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        fill={hasVoted ? Pista8Theme.primary : 'none'}
        style={{ color: hasVoted ? Pista8Theme.primary : 'currentColor' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <Count $hasVoted={hasVoted}>{likes}</Count>
    </Button>
  );
};

export default LikeButton;