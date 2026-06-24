import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { premiumTooltip } from '../../dashboard/styles/CommonStyles';
import { Lightbulb, Flame, Brain, Trash2, ShieldAlert } from 'lucide-react';
import type { PlaneIdea } from '../types';
import LikeButton from './LikeButton';
import FavoriteButton from './FavoriteButton';
import { Pista8Theme, breakpoints } from '../../../config/theme';
import CommentsSection from '../../comments/CommentsSection';
import { useAuth } from '../../../context/AuthContext';
import { useWallEventListener, wallEvents } from '../../../hooks/useWallEvents';
import { commentService } from '../../../services/comment.service';
import { ideaService } from '../../../services/idea.service';

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(28px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 25, 28, 0.55);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: ${overlayIn} 0.22s ease-out;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 12px;
  }
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 760px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border: 1px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 40px 80px rgba(20, 25, 28, 0.22);
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: ${breakpoints.mobile}) {
    border-radius: 20px;
    max-height: calc(100vh - 24px);
  }

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModalBanner = styled.div`
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  border-radius: 31px 31px 0 0;
  padding: 28px 36px 22px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px 20px 16px;
  }
`;

const BannerDots = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.13); color: white; }
`;

const IdeaTag = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 5px 12px;
  border-radius: 20px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  margin: 0 0 16px;
  color: white;
  font-size: 21px;
  font-weight: 900;
  line-height: 1.35;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 1;
  max-width: 440px;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
`;

const AuthorDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${Pista8Theme.primary};
`;

const AuthorName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.38);
  letter-spacing: 0.02em;
`;

const DateChip = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.28);
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 2px 9px;
  border-radius: 20px;
  letter-spacing: 0.02em;
  margin-left: 4px;
`;

const Body = styled.div`
  padding: 28px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: ${breakpoints.mobile}) {
    padding: 20px 16px 24px;
  }
`;

const SectionBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0;
  text-align: center;
`;

const SectionLabel = styled.p`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
  margin: 0;
`;

const ActionsRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CommentToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(p) => (p.$active ? `${Pista8Theme.primary}12` : 'rgba(248,249,250,0.9)')};
  color: ${(p) => (p.$active ? Pista8Theme.primary : '#94a3b8')};
  border: 1.5px solid ${(p) => (p.$active ? `${Pista8Theme.primary}50` : 'rgba(72,80,84,0.1)')};
  border-radius: 99px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: ${(p) => (p.$active ? `0 0 0 3px ${Pista8Theme.primary}18` : 'none')};

  &:hover {
    background: ${(p) => (p.$active ? `${Pista8Theme.primary}16` : `${Pista8Theme.primary}08`)};
    border-color: ${(p) => (p.$active ? `${Pista8Theme.primary}66` : `${Pista8Theme.primary}40`)};
    color: ${Pista8Theme.primary};
  }
`;

const CommentTooltipContainer = styled.div`
  position: relative;
  display: inline-flex;

  &:hover .custom-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const CommentTooltipText = styled.span`
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

const Counter = styled.span`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
`;

const ProposalText = styled.p`
  margin: 0;
  width: 100%;
  font-size: 16px;
  line-height: 1.8;
  color: #5a6470;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const ReadMoreButton = styled.button`
  border: 0;
  background: transparent;
  color: ${Pista8Theme.primary};
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatPill = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid rgba(72, 80, 84, 0.08);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: #485054;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;

  svg {
    color: ${props => props.$color};
    fill: ${props => props.$color}18;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
  }
`;

const DeleteIdeaButton = styled.button<{ $isAdmin?: boolean; $tooltipText?: string; $tooltipPosition?: 'top' | 'bottom'; $tooltipAlign?: 'center' | 'right' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220,38,38,0.15);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  
  ${premiumTooltip}
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(26, 31, 34, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.18s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const ConfirmCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px 28px 24px;
  max-width: 400px;
  width: calc(100% - 32px);
  box-shadow: 0 16px 48px rgba(26, 31, 34, 0.18);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.22s cubic-bezier(0.22, 0.68, 0, 1.1);
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

const ConfirmIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(198, 40, 40, 0.08);
  border: 1.5px solid rgba(198, 40, 40, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  color: #1a1f22;
  text-align: center;
`;

const ConfirmBody = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.65;
  text-align: center;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmBtn = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid ${p => p.$danger ? '#c62828' : 'rgba(72,80,84,0.18)'};
  background: ${p => p.$danger ? '#c62828' : 'white'};
  color: ${p => p.$danger ? 'white' : '#485054'};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  &:hover {
    background: ${p => p.$danger ? '#b71c1c' : '#f8f9fa'};
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
`;

interface IdeaDetailModalProps {
  idea: PlaneIdea;
  onClose: () => void;
  showStats?: boolean;
}

export const IdeaDetailModal = ({ idea, onClose, showStats = false }: IdeaDetailModalProps) => {
  const { userProfile } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(idea.commentsCount);
  const [showFullProposal, setShowFullProposal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const commentsRef = useRef<HTMLDivElement | null>(null);

  const isAuthor = !!(userProfile?.id && idea.authorId && userProfile.id === idea.authorId);
  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'ORGANIZATION';
  const canDelete = isAuthor || isAdmin;

  const triggerDelete = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      await ideaService.deleteIdea(idea.id);
      wallEvents.emit('idea_deleted', { ideaId: idea.id });
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al procesar la solicitud.');
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setCommentsCount(idea.commentsCount);
    setIsCommentsOpen(false);
    setShowFullProposal(false);
  }, [idea.id, idea.commentsCount]);

  useWallEventListener('comment_count_changed', ({ ideaId, count }) => {
    if (!ideaId || ideaId !== idea.id) return;

    if (typeof count === 'number' && count >= 0) {
      setCommentsCount(count);
      return;
    }

    commentService
      .getComments({ ideaId: idea.id, page: 1, limit: 1 })
      .then((res) => setCommentsCount(res.data.total ?? commentsCount))
      .catch(() => {
      });
  });

  useEffect(() => {
    if (!isCommentsOpen) return;
    requestAnimationFrame(() => {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isCommentsOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const proposalText = idea.solution || 'No se detalló la solución.';
  const shouldTruncateProposal = proposalText.length > 420;
  const shownProposal = showFullProposal || !shouldTruncateProposal
    ? proposalText
    : `${proposalText.slice(0, 420).trimEnd()}...`;

  const modalContent = (
    <>
      <ModalOverlay onClick={handleOverlayClick}>
        <ModalContainer>
        <ModalBanner>
          <BannerDots />
          <CloseButton onClick={onClose} aria-label="Cerrar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseButton>

          <IdeaTag>Idea en vuelo</IdeaTag>
          <ModalTitle>{idea.title}</ModalTitle>
          <AuthorRow>
            <AuthorDot />
            <AuthorName>{idea.authorName}</AuthorName>
            {idea.createdAt && (
              <DateChip>
                {new Date(idea.createdAt).toLocaleDateString('es', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </DateChip>
            )}
          </AuthorRow>
        </ModalBanner>

        <Body>
          <SectionBlock>
            <SectionLabel>La propuesta</SectionLabel>
            <ProposalText>{shownProposal}</ProposalText>
            {shouldTruncateProposal && (
              <ReadMoreButton type="button" onClick={() => setShowFullProposal((current) => !current)}>
                {showFullProposal ? 'Ver menos' : 'Leer más'}
              </ReadMoreButton>
            )}
          </SectionBlock>

          <SectionBlock>
            <ActionsRow>
              {showStats ? (
                <StatsContainer>
                  <StatPill $color="#f59e0b" title="Buena idea: Me interesa, esta propuesta resuelve algo real.">
                    <Lightbulb size={18} />
                    <span>{idea.goodCount ?? 0}</span>
                  </StatPill>
                  <StatPill $color="#ef4444" title="Tiene futuro: Veo mucho potencial estratégico en esta idea.">
                    <Flame size={18} />
                    <span>{idea.futureCount ?? 0}</span>
                  </StatPill>
                  <StatPill $color="#64748b" title="Complicado: Interesante, pero parece difícil de implementar.">
                    <Brain size={18} />
                    <span>{idea.complexCount ?? 0}</span>
                  </StatPill>
                </StatsContainer>
              ) : (
                <>
                  <FavoriteButton 
                    ideaId={idea.id} 
                    hasFavorited={idea.hasFavorited} 
                    disabled={idea.challengeStatus === 'CLOSED'} 
                  />
                  <LikeButton 
                    ideaId={idea.id} 
                    initialLikes={idea.likesCount} 
                    hasVoted={idea.hasVoted}
                    votedType={(idea as any).votedType}
                    isAuthor={isAuthor}
                    disabled={idea.challengeStatus === 'CLOSED'}
                  />
                </>
              )}

              <CommentTooltipContainer>
                <CommentToggleButton
                  type="button"
                  $active={isCommentsOpen}
                  onClick={() => setIsCommentsOpen((current) => !current)}
                  aria-label={isCommentsOpen ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                  <Counter>{commentsCount}</Counter>
                </CommentToggleButton>
                <CommentTooltipText className="custom-tooltip">Comentarios</CommentTooltipText>
              </CommentTooltipContainer>

              {canDelete && idea.challengeStatus !== 'CLOSED' && (
                <DeleteIdeaButton 
                  onClick={triggerDelete} 
                  disabled={isDeleting}
                  $isAdmin={isAdmin && !isAuthor}
                  $tooltipText={isAdmin && !isAuthor ? "Auditar (Eliminar) idea" : "Eliminar mi idea"}
                  aria-label="Eliminar idea"
                >
                  {isAdmin && !isAuthor ? <ShieldAlert size={16} /> : <Trash2 size={16} />}
                  {isDeleting ? 'Procesando...' : (isAdmin && !isAuthor ? 'Auditar' : 'Eliminar')}
                </DeleteIdeaButton>
              )}
            </ActionsRow>
          </SectionBlock>

          <SectionBlock ref={commentsRef as any} style={{ display: isCommentsOpen ? 'block' : 'none' }}>
            <CommentsSection
              ideaId={idea.id}
              challengeId={idea.challengeId}
              title="Debate y feedback"
              onCountChange={setCommentsCount}
              disabled={idea.challengeStatus === 'CLOSED'}
            />
          </SectionBlock>
        </Body>
      </ModalContainer>
    </ModalOverlay>

    {showConfirm && (
      <ConfirmOverlay onClick={() => setShowConfirm(false)}>
        <ConfirmCard onClick={e => e.stopPropagation()}>
          <ConfirmIcon>
            {isAdmin && !isAuthor ? (
              <ShieldAlert size={22} color="#c62828" />
            ) : (
              <Trash2 size={22} color="#c62828" />
            )}
          </ConfirmIcon>
          <ConfirmTitle>{isAdmin && !isAuthor ? "Auditar idea" : "Eliminar idea"}</ConfirmTitle>
          <ConfirmBody>
            {isAdmin && !isAuthor 
              ? "Estás a punto de eliminar esta idea como administrador. Esta acción es irreversible."
              : "Estás a punto de eliminar tu idea. Una vez borrada no podrás recuperarla."}
          </ConfirmBody>
          <ConfirmActions>
            <ConfirmBtn type="button" onClick={() => setShowConfirm(false)}>Cancelar</ConfirmBtn>
            <ConfirmBtn type="button" $danger onClick={handleConfirmDelete}>Sí, eliminar</ConfirmBtn>
          </ConfirmActions>
        </ConfirmCard>
      </ConfirmOverlay>
    )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default IdeaDetailModal;