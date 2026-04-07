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

const IdeationWall = () => {
  const { user, userProfile } = useAuth();
  const ds = useDashboardState();
  const form = useIdeationForm(userProfile, !user, ds.showToast);

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
                ⚠️ {ds.profileError}
              </div>
            )}
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
            loading={ds.loading}
            challenges={ds.challenges}
            activeFilter={ds.activeFilter}
            onFilterChange={ds.setActiveFilter}
            filterOpen={ds.filterOpen}
            setFilterOpen={ds.setFilterOpen}
            selectedChallengeId={ds.selectedChallenge?.id || ''}
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