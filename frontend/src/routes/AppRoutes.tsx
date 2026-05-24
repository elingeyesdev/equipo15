import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import CompleteProfilePage from '../pages/CompleteProfilePage';
import MyIdeasPage from '../pages/MyIdeasPage';
import IdeationWall from '../features/dashboard/IdeationWall';
import { DashboardRoutes } from '../features/dashboard/layout/DashboardRoutes';
import RunwayLoader from '../components/common/RunwayLoader';

const RoleRouter = () => {
  const { user, userProfile, refetchProfile } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (!userProfile) return <RunwayLoader />;

  const role = (userProfile.roleInfo?.name || userProfile.role || '').toLowerCase();
  const hasNoFaculty = userProfile.facultyId === null || userProfile.facultyId === undefined;

  if (hasNoFaculty && role === 'student') {
    return <CompleteProfilePage onComplete={refetchProfile} />;
  }

  if (role === 'student') {
    return (
      <Routes>
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="mis-ideas" element={<MyIdeasPage />} />
        <Route path="/" element={<IdeationWall />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="perfil" element={<ProfilePage />} />
      <Route path="/*" element={<DashboardRoutes />} />
    </Routes>
  );
};

const PrivateChallengeRedirect = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RunwayLoader />;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <Navigate to="/dashboard" state={{ privateChallengeId: challengeId }} replace />;
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
      <Route path="/reto/privado/:challengeId" element={<PrivateChallengeRedirect />} />
      <Route path="/dashboard/*" element={<RoleRouter />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/auth'} />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/auth'} />} />
    </Routes>
  );
};

export default AppContent;