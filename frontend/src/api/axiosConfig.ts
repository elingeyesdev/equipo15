import axios, { AxiosError } from 'axios';
import { auth } from '../config/firebase';
import { getActiveApiUrl, switchToBackup } from './failover';
import {
  clearStoredImpersonationToken,
  getStoredImpersonationSession,
  getStoredImpersonationToken,
} from '@/utils/impersonation-session';

const instance = axios.create({});

instance.interceptors.request.use(
  async (config) => {
    config.baseURL = getActiveApiUrl();
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
  async (error: AxiosError) => {
    const config = error.config;
    
    // Check if it's a network connection error or a proxy/server crash error (502, 503, 504)
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    const isServerError = error.response && [502, 503, 504].includes(error.response.status);

    if (config && (isNetworkError || isServerError) && !(config as any)._retry) {
      (config as any)._retry = true;
      
      const switched = switchToBackup();
      if (switched) {
        console.warn(`[Failover] Request failed. Retrying with backup URL: ${getActiveApiUrl()}`);
        config.baseURL = getActiveApiUrl();
        // Resolve path to make sure baseURL change is applied
        return instance(config);
      }
    }

    try {
      console.error('Axios response error:', error);
    } catch (e) {
    }

    const status = error?.response?.status as number | undefined;
    const backendMessage = String((error?.response?.data as any)?.message || '').toLowerCase();

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
