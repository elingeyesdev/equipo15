import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import IdeationWall from './components/dashboard/IdeationWall';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CompleteProfileView } from './components/auth/CompleteProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EvaluationPanel } from './components/evaluations/EvaluationPanel';

const RoleRouter = () => {
  const { user, userProfile, setProfile } = useAuth();
  
  if (!user) return <Navigate to="/auth" />;
  if (!userProfile) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Cargando Perfil...</div>;
  
  if (userProfile.facultyId == null && userProfile.role === 'student') {
    return <CompleteProfileView onComplete={() => setProfile({ ...userProfile, facultyId: 1 })} />;
  }

  switch (userProfile.role) {
    case 'company':
    case 'admin':
      return <AdminDashboard />;
    case 'judge':
      return <EvaluationPanel />;
    case 'student':
    default:
      return <IdeationWall />;
  }
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Conectando con Servidor...</div>;

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/dashboard/*" element={<RoleRouter />} />
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
