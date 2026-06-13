import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import axiosInstance from '@/api/axiosConfig';
import type { UserProfile } from '@/types/models';
import type { ApiResponse } from '@/types/api';
import {
  clearStoredImpersonationToken,
  getStoredImpersonationSession,
  setStoredImpersonationToken,
} from '@/utils/impersonation-session';
import type { ImpersonationSession } from '@/types/models';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  refetchProfile: () => Promise<void>;
  setSuppressAuth: (value: boolean) => void;
  impersonationSession: ImpersonationSession | null;
  setImpersonationToken: (token: string | null) => void;
  clearImpersonationSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  setProfile: () => { },
  refetchProfile: async () => { },
  setSuppressAuth: () => { },
  impersonationSession: null,
  setImpersonationToken: () => { },
  clearImpersonationSession: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const suppressAuthRef = useRef(false);
  const [impersonationSession, setImpersonationSession] = useState<ImpersonationSession | null>(
    () => getStoredImpersonationSession(),
  );

  const setSuppressAuth = useCallback((value: boolean) => {
    suppressAuthRef.current = value;
  }, []);

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<UserProfile>>('/users/profile');
      return response.data?.data || null;
    } catch {
      return null;
    }
  }, []);

  const syncProfile = useCallback(async (firebaseUser: User): Promise<UserProfile | null> => {
    try {
      const response = await axiosInstance.post<ApiResponse<UserProfile>>('/users/sync', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        preventCreation: true,
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  }, []);

  const refetchProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile();
      setUserProfile(profileData);
    }
  }, [user, fetchProfile]);

  const setImpersonationToken = useCallback((token: string | null) => {
    if (!token) {
      clearStoredImpersonationToken();
      setImpersonationSession(null);
      return;
    }

    const session = setStoredImpersonationToken(token);
    setImpersonationSession(session);
  }, []);

  const clearImpersonationSession = useCallback(async () => {
    clearStoredImpersonationToken();
    setImpersonationSession(null);
    await refetchProfile();
  }, [refetchProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          let profile = await fetchProfile();
          if (!profile) {
            profile = await syncProfile(currentUser);
          }

          if (profile) {
            setUserProfile(profile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Auth context load error:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchProfile, syncProfile]);

  useEffect(() => {
    if (user && impersonationSession) {
      void refetchProfile();
    }
  }, [user, impersonationSession, refetchProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      setProfile: setUserProfile,
      refetchProfile,
      setSuppressAuth,
      impersonationSession,
      setImpersonationToken,
      clearImpersonationSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
