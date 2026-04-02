import { useAuth } from '../../context/AuthContext';
import SkyCanvas from '../../features/sky-wall/SkyCanvas';

import * as S from './styles/LayoutStyles';

import Sidebar from './components/Sidebar';
import ChallengeList from './components/ChallengeList';
import StatsPanel from './components/StatsPanel';
import IdeaForm from './components/IdeaForm';
import FeedbackToast from './components/FeedbackToast';

import { useDashboardState } from './hooks/useDashboardState';
import { useIdeationForm } from './hooks/useIdeationForm';

const mockChallenges = [
  { id: 'mock1', title: 'Reto de Ingeniería UNIVALLE 2026', category: 'Ingeniería', ideasCount: 24, likesCount: 187, badge: 'ACTIVO' },
  { id: 'mock2', title: 'Innovación Sostenible Campus', category: 'Sostenibilidad', ideasCount: 15, likesCount: 102, badge: 'NUEVO' },
  { id: 'mock3', title: 'App para Bienestar Estudiantil', category: 'Tecnología', ideasCount: 31, likesCount: 243, badge: 'ACTIVO' },
];

const mockFacultades = [
  { name: 'Ingeniería', likes: 1870 },
  { name: 'Ciencias', likes: 1430 },
  { name: 'Humanidades', likes: 980 },
  { name: 'Medicina', likes: 760 },
  { name: 'Derecho', likes: 540 },
];

const mockLideres = [
  { name: 'Valentina R.', ideas: 120 },
  { name: 'Mateo G.', ideas: 95 },
  { name: 'Camila P.', ideas: 78 },
  { name: 'Andrés L.', ideas: 62 },
  { name: 'Sofía M.', ideas: 51 },
];

const IdeationWall = () => {
  const { user, userProfile } = useAuth();
  const ds = useDashboardState(mockChallenges, mockFacultades, mockLideres);
  const form = useIdeationForm(userProfile, !user, ds.showToast);

  const firstName = userProfile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || '';
  const fullName = userProfile?.displayName || user?.displayName || user?.email || '';

  const roleName: string = (userProfile?.roleId?.name || userProfile?.role || '').toLowerCase();
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
          <S.WelcomeZone>
            <S.Greeting>Hola, {userRole} <span>{firstName}</span></S.Greeting>
            <S.Sub>¿Listo para despegar tu próxima gran idea?</S.Sub>
          </S.WelcomeZone>

          <S.HamburgerBtn onClick={() => ds.setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" />
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" />
            </svg>
          </S.HamburgerBtn>
        </S.Header>

        <SkyCanvas />

        {ds.loading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Cargando desafíos...</div>
        ) : (
          <S.MainGrid>
            <ChallengeList
              challenges={ds.challenges}
              activeFilter={ds.activeFilter}
              onFilterChange={ds.setActiveFilter}
              filterOpen={ds.filterOpen}
              setFilterOpen={ds.setFilterOpen}
              selectedChallengeId={ds.selectedChallenge?.id}
              onSelectChallenge={ds.setSelectedChallenge}
              onRespond={c => ds.handleOpenForm(c, form.resetForm)}
            />

            <StatsPanel
              selectedChallenge={ds.selectedChallenge}
              challengeStats={ds.challengeStats}
              topFacultades={ds.topFacultades}
              topLideres={ds.topLideres}
            />
          </S.MainGrid>
        )}
      </S.Page>

      <FeedbackToast message={ds.toastMessage} onDismiss={ds.dismissToast} />

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