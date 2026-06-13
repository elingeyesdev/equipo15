import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import MyIdeasPage from '../pages/MyIdeasPage';
import MyFavoritesPage from '../pages/MyFavoritesPage';
import IdeationWall from '../features/dashboard/IdeationWall';
import { DashboardRoutes } from '../features/dashboard/layout/DashboardRoutes';
import RunwayLoader from '../components/common/RunwayLoader';
import NotFoundPage from '../components/errors/NotFoundPage';

const RoleRouter = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (!userProfile) return <Navigate to="/auth" replace />;

  const role = (userProfile.roleInfo?.name || userProfile.role || '').toLowerCase();

  if (role === 'student') {
    const isOtherRolePath =
      location.pathname.includes('/admin') ||
      location.pathname.includes('/company') ||
      location.pathname.includes('/judge');

    if (isOtherRolePath) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <Routes>
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="mis-ideas" element={<MyIdeasPage />} />
        <Route path="favoritos" element={<MyFavoritesPage />} />
        <Route path="/" element={<IdeationWall />} />
        <Route path="*" element={<NotFoundPage />} />
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
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RunwayLoader />;

  const from = location.state?.from || '/dashboard';
  const redirectTo = from.startsWith('/dashboard/') || from.includes('/perfil') ? '/dashboard' : from;

  return (
    <Routes>
      <Route path="/auth" element={user && userProfile ? <Navigate to={redirectTo} replace /> : <AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reto/privado/:challengeId" element={<PrivateChallengeRedirect />} />
      <Route path="/dashboard/*" element={<RoleRouter />} />
      <Route path="/" element={<Navigate to={user && userProfile ? '/dashboard' : '/auth'} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppContent;