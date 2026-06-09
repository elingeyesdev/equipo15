import axios from 'axios';
import { auth } from '../config/firebase';
import { API_URL } from '@/config/constants';
import {
  clearStoredImpersonationToken,
  getStoredImpersonationSession,
} from '@/utils/impersonation-session';

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use(
  async (config) => {
    const impersonationSession = getStoredImpersonationSession();
    if (impersonationSession?.token) {
      const hasAuthHeader = !!(
        (config.headers && (config.headers.Authorization || config.headers.authorization))
      );
      if (!hasAuthHeader) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${impersonationSession.token}`;
        return config;
      }
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

    if (status === 401 && backendMessage.includes('token de impersonación expirado')) {
      clearStoredImpersonationToken();
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
