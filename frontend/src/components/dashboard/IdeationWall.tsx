import { useAuth } from '../../context/AuthContext';
import SkyCanvas from '../../features/sky-wall/SkyCanvas';

// Styles
import * as S from './styles/DashboardStyles';

// Components
import Sidebar from './components/Sidebar';
import ChallengeList from './components/ChallengeList';
import StatsPanel from './components/StatsPanel';
import IdeaForm from './components/IdeaForm';
import FeedbackToast from './components/FeedbackToast';

// Hooks
import { useDashboardState } from './hooks/useDashboardState';
import { useIdeationForm } from './hooks/useIdeationForm';

const mockChallenges = [
  { id: 1, title: 'Reto de Ingeniería UNIVALLE 2026', category: 'Ingeniería', ideas: 24, likes: 187, badge: 'ACTIVO' },
  { id: 2, title: 'Innovación Sostenible Campus', category: 'Sostenibilidad', ideas: 15, likes: 102, badge: 'NUEVO' },
  { id: 3, title: 'App para Bienestar Estudiantil', category: 'Tecnología', ideas: 31, likes: 243, badge: 'ACTIVO' },
];

const topFacultades = [
  { name: 'Ingeniería', likes: 187 },
  { name: 'Ciencias', likes: 143 },
  { name: 'Humanidades', likes: 98 },
  { name: 'Medicina', likes: 76 },
  { name: 'Derecho', likes: 54 },
];

const topLideres = [
  { name: 'Valentina R.', ideas: 12 },
  { name: 'Mateo G.', ideas: 9 },
  { name: 'Camila P.', ideas: 7 },
  { name: 'Andrés L.', ideas: 6 },
  { name: 'Sofía M.', ideas: 5 },
];

const IdeationWall = () => {
  const { user } = useAuth();
  const ds = useDashboardState(mockChallenges);
  const form = useIdeationForm(ds.userProfile, !user, ds.showToast);

  const firstName = user?.displayName?.split(' ')[0] || 'Innovador';
  const fullName = user?.displayName?.trim() || user?.email || 'Guest';

  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    student: 'Estudiante',
    company: 'Empresa',
    guest: 'Invitado',
  };
  const userRole = roleNames[ds.userProfile?.role || 'guest'] || 'Innovador';

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

        <S.MainGrid>
          <ChallengeList
            challenges={mockChallenges}
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
            topFacultades={topFacultades}
            topLideres={topLideres}
          />
        </S.MainGrid>
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