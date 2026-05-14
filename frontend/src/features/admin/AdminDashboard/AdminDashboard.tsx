import { useAuth } from '../../../context/AuthContext';
import * as S from './styles/AdminStyles';


import AdminSidebar from './components/AdminSidebar';
import ChallengeBuilder from './components/ChallengeBuilder';


import { useAdminDashboard } from './hooks/useAdminDashboard';

export const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const ds = useAdminDashboard();

  return (
    <S.Root>
      <AdminSidebar 
        userProfile={userProfile}
        activeTab={ds.activeTab}
        setActiveTab={ds.setActiveTab}
        setShowForm={ds.setShowForm}
        setIsPreview={ds.setIsPreview}
        handleLogout={ds.handleLogout}
      />

      <S.Main>
        <S.PageHeader>
          <S.PageTitle>
            {userProfile?.role === 'company' ? 'Panel Corporativo' : 'Panel Administrativo'}
          </S.PageTitle>
        </S.PageHeader>

        <S.Canvas>
          {ds.activeTab === 'challenges' && (
            <ChallengeBuilder 
              userProfile={userProfile}
              showForm={ds.showForm}
              setShowForm={ds.setShowForm}
              isPreview={ds.isPreview}
              setIsPreview={ds.setIsPreview}
              formData={ds.formData}
              setFormData={ds.setFormData}
              togglePrivacy={ds.togglePrivacy}
              handleStartDateChange={ds.handleStartDateChange}
              copyToClipboard={ds.copyToClipboard}
              copyStatus={ds.copyStatus}
              formErrors={ds.formErrors}
              submitted={ds.submitted}
              setSubmitted={ds.setSubmitted}
              handleSaveChallenge={ds.handleSaveChallenge}
              saving={ds.saving}
            />
          )}

          {ds.activeTab === 'stats' && (
             <S.EmptyState>
                <S.EmptyLabel>El módulo de estadísticas estará disponible en el Sprint 2.</S.EmptyLabel>
             </S.EmptyState>
          )}
        </S.Canvas>
      </S.Main>
    </S.Root>
  );
};

export default AdminDashboard;