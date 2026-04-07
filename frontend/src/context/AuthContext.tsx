import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';

const API_URL = 'http://localhost:3000/api';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  setProfile: (profile: any) => void;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userProfile: null, 
  loading: true,
  setProfile: () => {},
  refetchProfile: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        return result.data || null;
      }
    } catch (e) {
      // remove log
    }
    return null;
  }, []);

  const syncProfile = useCallback(async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_URL}/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || ''
        })
      });
      if (res.ok) {
        const result = await res.json();
        return result.data || null;
      }
    } catch (e) {
      // remove log
    }
    return null;
  }, []);

  const refetchProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user);
      setUserProfile(profileData);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          let profile = await fetchProfile(currentUser);
          if (!profile) {
            profile = await syncProfile(currentUser);
          }
          
          if (profile) {
            setUserProfile(profile);
          } else {
             await auth.signOut();
             setUserProfile(null);
          }
        } catch (error) {
          await auth.signOut();
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchProfile, syncProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      setProfile: setUserProfile,
      refetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
