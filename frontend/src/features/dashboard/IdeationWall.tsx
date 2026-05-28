import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useWallEventListener } from '../../hooks/useWallEvents';

import * as S from './styles/LayoutStyles';

import { Sidebar } from './layout/Sidebar';
import IdeationViewport from './components/IdeationViewport';
import IdeationOverlay from './components/IdeationOverlay';
import type { RawIdea, PlaneIdea } from '../../features/sky-wall/types';
import { resolveDisplayName } from '../../utils/user.utils';

import { useDashboardState } from './hooks/useDashboardState';
import { useIdeationForm } from './hooks/useIdeationForm';
import type { AdvancedFilterState } from './components/AdvancedFilter';

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
    setHighlightedIdeaId(idea.id ?? null);
    const el = document.getElementById('ideation-wall');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

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

  const displayedWallIdeas = (() => {
    let ideas = advFilter.onlyFavorites
      ? wallIdeas.filter(idea => Boolean(idea.hasFavorited))
      : wallIdeas;
    if (advFilter.onlyMyIdeas && user) {
      ideas = ideas.filter(idea => (idea as any).authorId === (userProfile as any)?.id || (idea.author as any)?.firebaseUid === user.uid);
    }
    if (advFilter.facultyId) {
      ideas = ideas.filter(idea => (idea as any).authorFacultyId === advFilter.facultyId || (idea.author as any)?.studentProfile?.facultyId === advFilter.facultyId || (idea.author as any)?.facultyId === advFilter.facultyId);
    }
    if (advFilter.topLimit) {
      ideas = ideas.slice(0, advFilter.topLimit);
    }
    return ideas;
  })();

  const fullName = resolveDisplayName(userProfile as any) || user?.email || '';

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
        toastMessage={ds.toastMessage}
        dismissToast={ds.dismissToast}
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
      />
    </S.Root>
  );
};

export default IdeationWall;
