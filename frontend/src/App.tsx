import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import IdeationWall from './components/dashboard/IdeationWall';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminTestView } from './components/admin/AdminTestView';
import { CompleteProfileView } from './components/auth/CompleteProfileView';
import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3000/api';

const AppContent = () => {
  const { user } = useAuth();
  const [mongoProfile, setMongoProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
    return null;
  }, [user]);

  const syncProfile = useCallback(async () => {
    if (!user) return null;
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Innovador',
        role: 'student'
      })
    });
    if (res.ok) return await res.json();
    return null;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMongoProfile(null);
      setProfileChecked(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        let profile = await fetchProfile();

        if (!profile) {
          profile = await syncProfile();
        }

        if (!cancelled) {
          setMongoProfile(profile);
          setProfileChecked(true);
        }
      } catch (err) {
        console.error('Error en flujo de perfil:', err);
        if (!cancelled) setProfileChecked(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [user, fetchProfile, syncProfile]);

  const handleFacultyComplete = async () => {
    const profile = await fetchProfile();
    if (profile) {
      setMongoProfile(profile);
    }
  };

  if (!user) return <AuthPage />;

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        color: '#485054'
      }}>
        Conectando con Servidor...
      </div>
    );
  }

  if (profileChecked && mongoProfile && mongoProfile.facultyId == null) {
    return <CompleteProfileView onComplete={handleFacultyComplete} />;
  }

  if (profileChecked && !mongoProfile) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        color: '#485054',
        gap: '1rem'
      }}>
        <p>No se pudo cargar tu perfil. Verifica que el servidor esté activo.</p>
        <button onClick={() => window.location.reload()} style={{
          padding: '10px 20px',
          background: '#FE410A',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Reintentar
        </button>
      </div>
    );
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
