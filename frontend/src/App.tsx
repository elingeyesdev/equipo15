import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import IdeationWall from './components/dashboard/IdeationWall';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminTestView } from './components/admin/AdminTestView';
import { CompleteProfileView } from './components/auth/CompleteProfileView';
import { useState, useEffect } from 'react';

const AppContent = () => {
  const { user } = useAuth();
  const [mongoProfile, setMongoProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      user.getIdToken()
        .then(token => fetch('http://localhost:3000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }))
        .then(res => res.json())
        .then(data => {
          setMongoProfile(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (!user) return <AuthPage />;
  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Conectando con Servidor...</div>;
  
  if (mongoProfile && mongoProfile.facultyId == null) {
    return <CompleteProfileView onComplete={() => setMongoProfile({ ...mongoProfile, facultyId: 1 })} />;
  }

  return <IdeationWall />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin-test" element={<AdminTestView />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
