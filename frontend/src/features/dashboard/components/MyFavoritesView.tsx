import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, Bookmark, Loader2 } from 'lucide-react';
import InfoTooltip from '@/components/common/InfoTooltip';
import AdvancedFilter from './AdvancedFilter';
import type { AdvancedFilterState } from './AdvancedFilter';
import { ideaService } from '@/services/idea.service';
import { Sidebar } from '../layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import * as S from './MyFavoritesStyles';
import IdeaDetailModal from '@/features/sky-wall/components/IdeaDetailModal';
import Pista8Logo from '@/components/icons/Pista8Logo';
import type { PlaneIdea } from '@/features/sky-wall/types';

const MyFavoritesView: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [ideas, setIdeas] = useState<PlaneIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<PlaneIdea | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<AdvancedFilterState>({
    sortOrder: 'newest',
    topLimit: null,
    facultyId: null,
    onlyFavorites: false,
    onlyMyIdeas: false,
  });

  const resolvedName = userProfile?.displayName || 'Participante';
  const roleName = (userProfile?.roleInfo?.name || userProfile?.role || 'STUDENT').toLowerCase();
  const roleLabels: Record<string, string> = {
    student: 'participante',
    admin: 'administrador',
    company: 'empresa',
    judge: 'jurado',
  };
  const userRole = roleLabels[roleName] || 'participante';

  const sortedIdeas = React.useMemo(() => {
    const list = [...ideas];
    if (filter.sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());
    } else if (filter.sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime());
    } else if (filter.sortOrder === 'likes') {
      list.sort((a, b) => {
        const scoreA = (a.likesCount) || 0;
        const scoreB = (b.likesCount) || 0;
        return scoreB - scoreA;
      });
    } else if (filter.sortOrder === 'comments') {
      list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    }
    return list;
  }, [ideas, filter.sortOrder]);

  useEffect(() => {
    let active = true;

    const fetchMyFavorites = async () => {
      try {
        const response = await ideaService.getMyFavorites();
        if (active) {
          setIdeas(Array.isArray(response?.data) ? response.data : []);
        }
      } catch {
        if (active) {
          toast.error('No se pudieron cargar tus favoritos');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMyFavorites();
    return () => { active = false; };
  }, []);

  const handleOpenModal = useCallback((idea: PlaneIdea) => {
    setSelectedIdea(idea);
  }, []);

  return (
    <S.Wrapper>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <S.MainContent>
        <S.Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Pista8Logo fill="#1a1f22" accent="#FE410A" />
            <S.TitleContainer>
              <S.Title>
                Hola, {userRole} <span>{resolvedName}</span>
              </S.Title>
              <S.Subtitle>
                Mis Favoritos
              </S.Subtitle>
            </S.TitleContainer>
          </div>
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
              <Bookmark size={36} />
            </S.EmptyIconWrap>
            <S.EmptyTitle>Sin favoritos guardados</S.EmptyTitle>
            <S.EmptyText>
              Aún no has guardado ninguna idea en tus favoritos. Explora el panel y guarda las que más te gusten.
            </S.EmptyText>
            <S.EmptyButton onClick={() => navigate('/dashboard')}>
              Explorar Ideas
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
            <S.IdeasGrid $count={sortedIdeas.length}>
              {sortedIdeas.map((idea) => (
                <S.Card key={idea.id}>
                <S.CardBadge>
                  {(idea as any).challenge?.title || idea.challengeTitle || 'Reto'}
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
        <IdeaDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </S.Wrapper>
  );
};

export default MyFavoritesView;
