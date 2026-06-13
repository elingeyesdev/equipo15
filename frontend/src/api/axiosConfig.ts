import axios from 'axios';
import { auth } from '../config/firebase';
import { API_URL } from '@/config/constants';
import {
  clearStoredImpersonationToken,
  getStoredImpersonationSession,
  getStoredImpersonationToken,
} from '@/utils/impersonation-session';

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use(
  async (config) => {
    const impersonationSession = getStoredImpersonationSession();
    const isSyncRequest = config.url?.includes('/users/sync');
    
    if (impersonationSession?.token && !isSyncRequest) {
      config.headers = config.headers || {};
      config.headers['x-impersonation-token'] = impersonationSession.token;
    }

    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (!config.headers || !(config.headers.Authorization || config.headers.authorization)) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      console.error('Axios response error:', error);
    } catch (e) {
    }

    const status = error?.response?.status as number | undefined;
    const backendMessage = String(error?.response?.data?.message || '').toLowerCase();

    if (status === 401 && (
      backendMessage.includes('impersonación') || 
      backendMessage.includes('impersonacion') ||
      backendMessage.includes('espejo') ||
      getStoredImpersonationToken()
    )) {
      clearStoredImpersonationToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/admin/clients';
      }
      return new Promise(() => {});
    }

    if (status === 401) {
      error.message = 'Sesion expirada o no autorizada.';
    } else if (!error?.response) {
      error.message = 'No se pudo conectar con el servidor.';
    }

    return Promise.reject(error);
  },
);

export default instance;
