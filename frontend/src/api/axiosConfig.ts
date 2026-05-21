import axios from 'axios';
import { auth } from '../config/firebase';
import { getStoredImpersonationToken } from '@/utils/impersonation-session';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

instance.interceptors.request.use(
  async (config) => {
    const impersonationToken = getStoredImpersonationToken();
    if (impersonationToken) {
      config.headers.Authorization = `Bearer ${impersonationToken}`;
      return config;
    }

    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
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
