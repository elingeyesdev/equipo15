import axios from 'axios';
import { auth } from '../config/firebase';
import {
  clearStoredImpersonationToken,
  getStoredImpersonationSession,
} from '@/utils/impersonation-session';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

instance.interceptors.request.use(
  async (config) => {
    const impersonationSession = getStoredImpersonationSession();
    if (impersonationSession?.token) {
      // If the request already sets an Authorization header (e.g. explicit Firebase ID Token
      // for a sync/registration POST), do not overwrite it with the impersonation token.
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
      // Only set Firebase token if there's no existing Authorization header
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
    // Log full error to console in dev to aid debugging
    try {
      // eslint-disable-next-line no-console
      console.error('Axios response error:', error);
    } catch (e) {
      // ignore
    }

    const status = error?.response?.status as number | undefined;
    const backendMessage = String(error?.response?.data?.message || '').toLowerCase();

    if (status === 401 && backendMessage.includes('token de impersonación expirado')) {
      clearStoredImpersonationToken();
    }

    if (status === 401) {
      // Keep request rejection, but normalize a common auth failure message.
      error.message = 'Sesion expirada o no autorizada.';
    } else if (!error?.response) {
      error.message = 'No se pudo conectar con el servidor.';
    }

    return Promise.reject(error);
  },
);

export default instance;
