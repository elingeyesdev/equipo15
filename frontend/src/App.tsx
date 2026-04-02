import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import IdeationWall from './components/dashboard/IdeationWall';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CompleteProfileView } from './components/auth/CompleteProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EvaluationPanel } from './components/evaluations/EvaluationPanel';
import { ProfileView } from './components/profile/ProfileView';

const RoleRouter = () => {
  const { user, userProfile, refetchProfile } = useAuth();
  
  if (!user) return <Navigate to="/auth" />;
  if (!userProfile) return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#485054'}}>
      Conectando con Servidor...
    </div>
  );
  
  const role = (userProfile.roleId?.name || userProfile.role || '').toLowerCase();
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
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#485054'}}>
      Cargando Pista 8...
    </div>
  );

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
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
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
