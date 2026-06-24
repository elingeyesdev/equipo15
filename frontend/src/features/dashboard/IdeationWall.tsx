import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useWallEventListener } from '../../hooks/useWallEvents';
import api from '../../api/axiosConfig';

import * as S from './styles/LayoutStyles';

import { Sidebar } from './layout/Sidebar';
import IdeationViewport from './components/IdeationViewport';
import IdeationOverlay from './components/IdeationOverlay';
import type { RawIdea, PlaneIdea } from '../../features/sky-wall/types';
import { resolveDisplayName } from '../../utils/user.utils';

import { useDashboardState } from './hooks/useDashboardState';
import { useIdeationForm } from './hooks/useIdeationForm';
import type { AdvancedFilterState } from './components/AdvancedFilter';

import type { Challenge } from '../../types/models';
import type { IdeaDraft } from '../../services/idea.service';
import BottomNavbar from './components/BottomNavbar';
import { sortIdeas } from './helpers/sortIdeas';

const IdeationWall = () => {
  const { user, userProfile } = useAuth();
  const ds = useDashboardState();
  const form = useIdeationForm(userProfile, !user, ds.showToast);

  const [wallIdeas, setWallIdeas] = useState<RawIdea[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedListIdea, setSelectedListIdea] = useState<PlaneIdea | null>(null);
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const [highlightedIdeaId, setHighlightedIdeaId] = useState<string | null>(null);
  const [advFilter, setAdvFilter] = useState<AdvancedFilterState>({
    sortOrder: 'newest',
    topLimit: null,
    facultyId: null,
    onlyFavorites: false,
    onlyMyIdeas: false,
  });

  const socket = useSocket();

  useWallEventListener('vote_changed', (payload) => {
    setWallIdeas((prev) =>
      prev.map((idea) =>
        idea.id === payload.ideaId
          ? { ...idea, hasVoted: payload.hasVoted, likesCount: payload.likesCount, fireScore: payload.fireScore ?? idea.fireScore }
          : idea,
      ),
    );
  });

  useWallEventListener('favorite_changed', (payload) => {
    setWallIdeas((prev) =>
      prev.map((idea) =>
        idea.id === payload.ideaId
          ? { ...idea, isFavorite: payload.isFavorite }
          : idea,
      ),
    );
  });

  useWallEventListener('comment_count_changed', (payload) => {
    setWallIdeas((prev) =>
      prev.map((idea) =>
        idea.id === payload.ideaId
          ? { ...idea, commentsCount: payload.count }
          : idea,
      ),
    );
  });

  const handleSelectIdea = useCallback((idea: RawIdea) => {
    setSelectedListIdea(idea as PlaneIdea);
    if (ds.selectedChallenge?.status !== 'CLOSED') {
      setHighlightedIdeaId(idea.id ?? null);
      const el = document.getElementById('ideation-wall');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [ds.selectedChallenge?.status]);

  const handleHighlightIdea = useCallback((idea: RawIdea) => {
    setHighlightedIdeaId(idea.id ?? null);
  }, []);

  const handleIdeasLoaded = useCallback((ideas: RawIdea[]) => {
    setWallIdeas(ideas);
    setListLoading(false);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIdeaCreated = (rawIdea: RawIdea) => {
      setWallIdeas((prev) => {
        if (prev.some(p => p.id === rawIdea.id || p.id === rawIdea._id)) return prev;
        return [{ ...rawIdea, id: rawIdea.id ?? rawIdea._id } as RawIdea, ...prev];
      });
    };

    const handleIdeaVoted = (payload: { ideaId: string, likesCount: number, fireScore?: number }) => {
      setWallIdeas((prev) =>
        prev.map((idea) =>
          idea.id === payload.ideaId
            ? { ...idea, likesCount: payload.likesCount, fireScore: payload.fireScore ?? idea.fireScore }
            : idea
        )
      );
    };

    socket.on('idea_created', handleIdeaCreated);
    socket.on('idea:voted', handleIdeaVoted);
    socket.on('idea:unvoted', handleIdeaVoted);

    return () => {
      socket.off('idea_created', handleIdeaCreated);
      socket.off('idea:voted', handleIdeaVoted);
      socket.off('idea:unvoted', handleIdeaVoted);
    };
  }, [socket]);

  useEffect(() => {
    if (!highlightedIdeaId) return;
    const timer = setTimeout(() => setHighlightedIdeaId(null), 5000);
    return () => clearTimeout(timer);
  }, [highlightedIdeaId]);

  useEffect(() => {
    if (!socket) return;
    const challengeId = ds.selectedChallenge?.id;
    if (challengeId) {
      socket.emit('join_challenge', challengeId);
      return () => { socket.emit('leave_challenge', challengeId); };
    }
  }, [socket, ds.selectedChallenge?.id]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const ideaIdFromUrl = queryParams.get('ideaId');
    const challengeIdFromUrl = queryParams.get('challengeId');

    if (challengeIdFromUrl && ds.challenges.length > 0) {
      const matchedChallenge = ds.challenges.find(c => c.id === challengeIdFromUrl);
      if (matchedChallenge && ds.selectedChallenge?.id !== challengeIdFromUrl) {
        ds.selectChallenge(matchedChallenge);
        // Clear param
        const url = new URL(window.location.href);
        url.searchParams.delete('challengeId');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }

    if (ideaIdFromUrl && ds.challenges.length > 0) {
      (async () => {
        try {
          const response = await api.get(`/ideas/${ideaIdFromUrl}`);
          const ideaData = response.data?.data || response.data;
          if (ideaData && ideaData.challengeId) {
            const matchedChallenge = ds.challenges.find(c => c.id === ideaData.challengeId);
            if (matchedChallenge) {
              if (ds.selectedChallenge?.id !== ideaData.challengeId) {
                ds.selectChallenge(matchedChallenge);
              }
              const timer = setInterval(() => {
                setWallIdeas((currentIdeas) => {
                  const matchedIdea = currentIdeas.find(idea => idea.id === ideaIdFromUrl || idea._id === ideaIdFromUrl);
                  if (matchedIdea) {
                    clearInterval(timer);
                    handleSelectIdea(matchedIdea);
                    // Clear param
                    const url = new URL(window.location.href);
                    url.searchParams.delete('ideaId');
                    window.history.replaceState({}, document.title, url.pathname + url.search);
                  }
                  return currentIdeas;
                });
              }, 300);

              setTimeout(() => clearInterval(timer), 6000);
            }
          }
        } catch (error) {
          console.error('Error auto-selecting idea from URL:', error);
        }
      })();
    }
  }, [ds.challenges, ds.selectedChallenge?.id, handleSelectIdea]);

  const displayedWallIdeas = (() => {
    let ideas = advFilter.onlyFavorites
      ? wallIdeas.filter(idea => Boolean(idea.hasFavorited))
      : wallIdeas;
    if (advFilter.onlyMyIdeas && user) {
      ideas = ideas.filter(idea => (idea as any).authorId === (userProfile as any)?.id || (idea.author as any)?.firebaseUid === user.uid);
    }
    const challengeId = ds.selectedChallenge?.id;
    if (challengeId) {
      ideas = ideas.filter(idea => idea.challengeId === challengeId);
    }
    if (advFilter.facultyId) {
      ideas = ideas.filter(idea => (idea as any).authorFacultyId === advFilter.facultyId || (idea.author as any)?.studentProfile?.facultyId === advFilter.facultyId || (idea.author as any)?.facultyId === advFilter.facultyId);
    }
    if (advFilter.onlyPodium) {
      const podiumIds = [...ideas]
        .filter(idea => (idea.finalScore || 0) > 0 || (idea.fireScore || 0) > 0)
        .sort((a, b) => (b.finalScore || b.fireScore || 0) - (a.finalScore || a.fireScore || 0))
        .slice(0, 3)
        .map(idea => idea.id ?? idea._id);
      ideas = ideas.filter(idea => podiumIds.includes(idea.id ?? idea._id));
    }
    if (advFilter.topLimit) {
      ideas = ideas.slice(0, advFilter.topLimit);
    }

    ideas = sortIdeas(ideas, advFilter);

    return ideas.map(idea => ({
      ...idea,
      challengeStatus: ds.selectedChallenge?.status,
    }));
  })();

  const fullName = resolveDisplayName(userProfile as any) || user?.email || '';

  const mapDraftChallenge = (draft: IdeaDraft): Challenge => {
    const challenge = draft.challenge;
    return {
      id: draft.challengeId,
      title: challenge?.title || 'Reto',
      status: (challenge?.status as Challenge['status']) || 'Activo',
      facultyId: challenge?.facultyId ?? null,
      faculty: challenge?.faculty ?? null,
      faculties: (challenge as any)?.faculties ?? [],
      category: (challenge as any)?.challengeFaculties && (challenge as any).challengeFaculties.length > 0
        ? (challenge as any).challengeFaculties.map((cf: any) => cf.faculty?.name).filter(Boolean).join(', ')
        : (challenge as any)?.faculties && (challenge as any).faculties.length > 0
        ? (challenge as any).faculties[0].name
        : challenge?.faculty?.name || 'General',
      isPrivate: false,
    };
  };

  const handleContinueDraft = (draft: IdeaDraft) => {
    const fullChallenge = ds.challenges.find(c => c.id === draft.challengeId);
    const mappedChallenge = fullChallenge || mapDraftChallenge(draft);
    ds.setFormChallenge(mappedChallenge);
    ds.selectChallenge(mappedChallenge);
    form.loadFromDraft(draft);
  };

  const handleConfirmSubmit = async () => {
    if (form.formSaving) return;
    ds.setConfirmSubmitOpen(false);
    const success = await form.handleIdeaSubmit('public', ds.formChallenge);
    if (success) ds.handleCloseForm(form.resetForm);
  };

  return (
    <S.Root>
      <Sidebar open={ds.sidebarOpen} onClose={() => ds.setSidebarOpen(false)} />

      <IdeationViewport
        ds={ds}
        showAllIdeas={showAllIdeas}
        setShowAllIdeas={setShowAllIdeas}
        displayedWallIdeas={displayedWallIdeas}
        listLoading={listLoading}
        advFilter={advFilter}
        setAdvFilter={(next) => {
          if (next.sortOrder !== advFilter.sortOrder) {
            ds.setSortOrder(next.sortOrder);
            setListLoading(true);
          }
          setAdvFilter(next);
        }}
        highlightedIdeaId={highlightedIdeaId}
        handleSelectIdea={handleSelectIdea}
        handleHighlightIdea={handleHighlightIdea}
        handleIdeasLoaded={handleIdeasLoaded}
        formResetForm={form.resetForm}
      />

      <IdeationOverlay
        selectedListIdea={selectedListIdea}
        setSelectedListIdea={setSelectedListIdea}
        formOpen={ds.formOpen}
        formChallenge={ds.formChallenge}
        fullName={fullName}
        isGuest={!user}
        onCloseForm={() => ds.handleCloseForm(form.resetForm)}
        form={form}
        onConfirm={handleConfirmSubmit}
        confirmOpen={ds.confirmSubmitOpen}
        setConfirmOpen={ds.setConfirmSubmitOpen}
        showToast={ds.showToast}
        onContinueDraft={handleContinueDraft}
      />
      <BottomNavbar />
    </S.Root>
  );
};

export default IdeationWall;
