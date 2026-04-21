import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SkyCanvas from '../../features/sky-wall';

import * as S from './styles/LayoutStyles';

import Sidebar from './components/Sidebar';
import ChallengeList from './components/ChallengeList';
import StatsPanel from './components/StatsPanel';
import IdeaForm from './components/IdeaForm';
import FeedbackToast from './components/FeedbackToast';
import OmniSearchBar from './components/OmniSearchBar';
import SortToggle from './components/SortToggle';
import IdeasChronologicalList from './components/IdeasChronologicalList';
import IdeaDetailModal from '../../features/sky-wall/components/IdeaDetailModal';
import type { Challenge } from '../../types/models';
import type { RawIdea, PlaneIdea } from '../../features/sky-wall/types';

import { useDashboardState } from './hooks/useDashboardState';
import { useIdeationForm } from './hooks/useIdeationForm';

const IdeationWall = () => {
  const { user, userProfile } = useAuth();
  const ds = useDashboardState();
  const form = useIdeationForm(userProfile, !user, ds.showToast);

  // Ideas cargadas por SkyCanvas — para la lista cronológica
  const [wallIdeas, setWallIdeas] = useState<RawIdea[]>([]);
  const [listLoading, setListLoading] = useState(false);
  // Idea seleccionada desde la lista (abre el mismo modal que los aviones)
  const [selectedListIdea, setSelectedListIdea] = useState<PlaneIdea | null>(null);

  const handleIdeasLoaded = (ideas: RawIdea[]) => {
    setWallIdeas(ideas);
    setListLoading(false);
  };

  const firstName = userProfile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || '';
  const fullName = userProfile?.displayName || user?.displayName || user?.email || '';

  const roleName: string = (userProfile?.roleInfo?.name || userProfile?.role || '').toLowerCase();
  const roleLabels: Record<string, string> = {
    admin: 'administrador',
    student: 'estudiante',
    company: 'empresa',
    judge: 'jurado',
  };
  const userRole = roleLabels[roleName] || 'participante';

  const handleConfirmSubmit = async () => {
    if (form.formSaving) return;
    ds.setConfirmSubmitOpen(false);
    const success = await form.handleIdeaSubmit('public', ds.formChallenge);
    if (success) ds.handleCloseForm(form.resetForm);
  };

  return (
    <S.Root>
      <Sidebar open={ds.sidebarOpen} onClose={() => ds.setSidebarOpen(false)} />

      <S.Page>
        <S.Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" width="110" height="28">
              <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#1a1f22" letterSpacing="-2">PIST</text>
              <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
              <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#1a1f22">8</text>
            </svg>
            <S.WelcomeZone>
              <S.Greeting>Hola, {userRole} <span>{firstName}</span></S.Greeting>
              <S.Sub>¿Listo para despegar tu próxima gran idea?</S.Sub>

              {ds.profileError && (
                <div style={{
                  margin: '12px 0 0',
                  padding: '8px 16px',
                  background: '#fff5f5',
                  color: '#e53e3e',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid #feb2b2',
                  fontWeight: '600'
                }}>
                  {ds.profileError}
                </div>
              )}
            </S.WelcomeZone>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <OmniSearchBar
              value={ds.searchQuery}
              onChange={ds.setSearchQuery}
            />
            <S.HamburgerBtn onClick={() => ds.setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" />
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" />
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" />
              </svg>
            </S.HamburgerBtn>
          </div>
        </S.Header>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 10px', flexWrap: 'wrap', gap: '8px' }}>
          <SortToggle value={ds.sortOrder} onChange={ds.setSortOrder} />
        </div>

        <SkyCanvas
          challengeId={ds.selectedChallenge?.id}
          challengeFacultyId={ds.selectedChallenge?.facultyId ?? undefined}
          isDashboardLoading={ds.loading}
          search={ds.debouncedSearch}
          sort={ds.sortOrder ?? undefined}
          onIdeasLoaded={handleIdeasLoaded}
        />

        {ds.sortOrder && (
          <IdeasChronologicalList
            ideas={wallIdeas}
            sortOrder={ds.sortOrder}
            isLoading={listLoading}
            onSelectIdea={setSelectedListIdea}
          />
        )}

        <S.MainGrid>
          <ChallengeList
            loading={ds.loading}
            challenges={ds.challenges}
            activeFilter={ds.activeFilter}
            onFilterChange={ds.setActiveFilter}
            filterOpen={ds.filterOpen}
            setFilterOpen={ds.setFilterOpen}
            selectedChallengeId={ds.selectedChallenge?.id || ''}
            onSelectChallenge={ds.setSelectedChallenge}
            onRespond={(c: Challenge) => ds.handleOpenForm(c, form.resetForm)}
            onClearSelection={ds.clearSelectedChallenge}
            searchQuery={ds.debouncedSearch}
            userFacultyId={userProfile?.facultyId}
          />

          <StatsPanel
            selectedChallenge={ds.selectedChallenge}
            challengeStats={ds.challengeStats}
          />
        </S.MainGrid>
      </S.Page>

      <FeedbackToast message={ds.toastMessage} onDismiss={ds.dismissToast} />

      {selectedListIdea && (
        <IdeaDetailModal
          idea={selectedListIdea}
          onClose={() => setSelectedListIdea(null)}
        />
      )}

      <IdeaForm
        open={ds.formOpen}
        challenge={ds.formChallenge}
        fullName={fullName}
        isGuest={!user}
        onClose={() => ds.handleCloseForm(form.resetForm)}
        form={form}
        onConfirm={handleConfirmSubmit}
        confirmOpen={ds.confirmSubmitOpen}
        setConfirmOpen={ds.setConfirmSubmitOpen}
      />
    </S.Root>
  );
};

export default IdeationWall;