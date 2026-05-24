import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, Lightbulb, Loader2, Flame, Brain } from 'lucide-react';
import InfoTooltip from '@/components/common/InfoTooltip';
import AdvancedFilter from './AdvancedFilter';
import type { AdvancedFilterState } from './AdvancedFilter';
import { ideaService } from '@/services/idea.service';
import CommentsSection from '@/features/comments/CommentsSection';
import { Sidebar } from '../layout/Sidebar';
import * as S from './MyIdeasStyles';

interface IdeaData {
  id: string;
  title: string;
  problem: string;
  solution: string;
  likesCount: number;
  goodCount: number;
  futureCount: number;
  complexCount: number;
  commentsCount: number;
  fireScore: number;
  authorId: string;
  challengeId: string;
  createdAt: string;
  challenge?: { id: string; title: string; status: string };
}

const REACTION_CONFIG = [
  { key: 'goodCount' as const, label: 'Buena idea', Icon: Lightbulb, color: '#f59e0b' },
  { key: 'futureCount' as const, label: 'Tiene futuro', Icon: Flame, color: '#ef4444' },
  { key: 'complexCount' as const, label: 'Complicado', Icon: Brain, color: '#64748b' },
];

const MyIdeaDetailModal: React.FC<{ idea: IdeaData; onClose: () => void }> = ({ idea, onClose }) => {
  const [prevIdeaId, setPrevIdeaId] = useState(idea.id);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(idea.commentsCount);
  const [showFullProposal, setShowFullProposal] = useState(false);
  const commentsRef = useRef<HTMLDivElement | null>(null);

  if (idea.id !== prevIdeaId) {
    setPrevIdeaId(idea.id);
    setCommentsCount(idea.commentsCount);
    setIsCommentsOpen(false);
    setShowFullProposal(false);
  }

  useEffect(() => {
    if (!isCommentsOpen) return;
    requestAnimationFrame(() => {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isCommentsOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const proposalText = idea.solution || 'Sin contenido de propuesta.';
  const shouldTruncate = proposalText.length > 420;
  const shownProposal = showFullProposal || !shouldTruncate
    ? proposalText
    : `${proposalText.slice(0, 420).trimEnd()}...`;

  return createPortal(
    <S.ModalOverlay onClick={handleOverlayClick}>
      <S.ModalContainer>
        <S.ModalBanner>
          <S.BannerDots />
          <S.ModalCloseBtn onClick={onClose} aria-label="Cerrar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </S.ModalCloseBtn>

          <S.ModalTag>Mi propuesta</S.ModalTag>
          <S.ModalTitle>{idea.title}</S.ModalTitle>
          {idea.createdAt && (
            <S.ModalDateChip>
              {new Date(idea.createdAt).toLocaleDateString('es', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </S.ModalDateChip>
          )}
        </S.ModalBanner>

        <S.ModalBody>
          <S.SectionBlock>
            <S.SectionLabel>La propuesta</S.SectionLabel>
            <S.ProposalText>{shownProposal}</S.ProposalText>
            {shouldTruncate && (
              <S.ReadMoreButton type="button" onClick={() => setShowFullProposal((c) => !c)}>
                {showFullProposal ? 'Ver menos' : 'Leer más'}
              </S.ReadMoreButton>
            )}
          </S.SectionBlock>

          <S.SectionBlock>
            <S.ActionsRow>
              {REACTION_CONFIG.map(({ key, label, Icon, color }) => (
                <S.TooltipContainer key={key}>
                  <S.ReactionPill>
                    <Icon size={16} strokeWidth={2.5} color={color} />
                    <S.ReactionCount>{idea[key]}</S.ReactionCount>
                  </S.ReactionPill>
                  <S.TooltipText className="custom-tooltip">{label}</S.TooltipText>
                </S.TooltipContainer>
              ))}

              <S.TooltipContainer>
                <S.CommentToggleButton
                  type="button"
                  $active={isCommentsOpen}
                  onClick={() => setIsCommentsOpen((c) => !c)}
                  aria-label={isCommentsOpen ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                  <S.Counter>{commentsCount}</S.Counter>
                </S.CommentToggleButton>
                <S.TooltipText className="custom-tooltip">Comentarios</S.TooltipText>
              </S.TooltipContainer>
            </S.ActionsRow>
          </S.SectionBlock>

          <S.SectionBlock ref={commentsRef} style={{ display: isCommentsOpen ? 'block' : 'none' }}>
            <CommentsSection
              ideaId={idea.id}
              challengeId={idea.challengeId}
              title="Debate y feedback"
              onCountChange={setCommentsCount}
            />
          </S.SectionBlock>
        </S.ModalBody>
      </S.ModalContainer>
    </S.ModalOverlay>,
    document.body,
  );
};

const MyIdeasView: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<IdeaData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<AdvancedFilterState>({
    sortOrder: 'newest',
    topLimit: null,
    facultyId: null,
    onlyFavorites: false,
    onlyMyIdeas: false,
  });

  const sortedIdeas = React.useMemo(() => {
    const list = [...ideas];
    if (filter.sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter.sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filter.sortOrder === 'likes') {
      list.sort((a, b) => {
        const scoreA = a.fireScore || (a.goodCount + a.futureCount) || 0;
        const scoreB = b.fireScore || (b.goodCount + b.futureCount) || 0;
        return scoreB - scoreA;
      });
    } else if (filter.sortOrder === 'comments') {
      list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    }
    return list;
  }, [ideas, filter.sortOrder]);

  useEffect(() => {
    let active = true;

    const fetchMyIdeas = async () => {
      try {
        const response = await ideaService.getMyIdeas();
        if (active) {
          setIdeas(Array.isArray(response?.data) ? response.data : []);
        }
      } catch {
        if (active) {
          toast.error('No se pudieron cargar tus ideas');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMyIdeas();
    return () => { active = false; };
  }, []);

  const handleOpenModal = useCallback((idea: IdeaData) => {
    setSelectedIdea(idea);
  }, []);

  return (
    <S.Wrapper>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <S.MainContent>
        <S.Header>
          <S.TitleContainer>
            <S.Title>
              Mis <span>Ideas</span>
            </S.Title>
            <S.Subtitle>
              Gestiona y revisa todas tus propuestas enviadas.
            </S.Subtitle>
          </S.TitleContainer>
          <S.HamburgerBtn onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </S.HamburgerBtn>
        </S.Header>

        {loading ? (
          <S.LoaderWrapper>
            <Loader2 size={32} color="#FE410A" style={{ animation: 'spin 1s linear infinite' }} />
          </S.LoaderWrapper>
        ) : ideas.length === 0 ? (
          <S.EmptyState>
            <S.EmptyIconWrap>
              <Lightbulb size={36} />
            </S.EmptyIconWrap>
            <S.EmptyTitle>Sin ideas enviadas</S.EmptyTitle>
            <S.EmptyText>
              Aún no has compartido ninguna idea. Anímate a participar en los retos activos.
            </S.EmptyText>
            <S.EmptyButton onClick={() => navigate('/dashboard')}>
              Explorar Retos
            </S.EmptyButton>
          </S.EmptyState>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '24px' }}>
              <AdvancedFilter
                value={filter}
                onChange={setFilter}
                onlySort={true}
              />
            </div>
            <S.IdeasGrid>
              {sortedIdeas.map((idea) => (
                <S.Card key={idea.id}>
                <S.CardBadge>
                  {idea.challenge?.title || 'Reto'}
                </S.CardBadge>
                <S.CardTitle>{idea.title}</S.CardTitle>
                <S.CardFooter>
                  <S.ActionButton onClick={() => handleOpenModal(idea)}>
                    Ver más información
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </S.ActionButton>
                  <InfoTooltip text="Detalles y feedback." size={20} width={160} />
                </S.CardFooter>
              </S.Card>
            ))}
          </S.IdeasGrid>
          </>
        )}
      </S.MainContent>

      {selectedIdea && (
        <MyIdeaDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </S.Wrapper>
  );
};

export default MyIdeasView;
