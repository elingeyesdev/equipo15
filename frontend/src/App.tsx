import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import AuthPage from './components/auth/AuthPage';
import IdeationWall from './components/dashboard/IdeationWall';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CompleteProfileView } from './components/auth/CompleteProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EvaluationPanel } from './components/evaluations/EvaluationPanel';
import { ProfileView } from './components/profile/ProfileView';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { GlobalErrorBoundary } from './components/errors/GlobalErrorBoundary';
import RunwayLoader from './components/common/RunwayLoader';

const RoleRouter = () => {
  const { user, userProfile, refetchProfile } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (!userProfile) return <RunwayLoader />;

  const role = (userProfile.roleInfo?.name || userProfile.role || '').toLowerCase();
  const hasNoFaculty = userProfile.facultyId === null || userProfile.facultyId === undefined;

  if (hasNoFaculty && role === 'student') {
    return <CompleteProfileView onComplete={refetchProfile} />;
  }

  return (
    <Routes>
      <Route path="perfil" element={<ProfileView />} />
      <Route path="/" element={
        (() => {
          switch (role) {
            case 'company':
            case 'admin':
              return <AdminDashboard />;
            case 'judge':
              return <EvaluationPanel />;
            case 'student':
            default:
              return <IdeationWall />;
          }
        })()
      } />
      <Route path="reto/:challengeId" element={
        role === 'student' ? <IdeationWall /> : <Navigate to="/dashboard" replace />
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RunwayLoader />;

  const from = location.state?.from || '/dashboard';
  const redirectTo = from.includes('/perfil') ? '/dashboard' : from;

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to={redirectTo} replace /> : <AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard/*" element={<RoleRouter />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalErrorBoundary>
          <AppContent />
          <Toaster richColors position="top-right" />
        </GlobalErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
