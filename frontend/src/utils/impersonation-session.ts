import type { ImpersonationSession } from '@/types/models';

export const IMPERSONATION_STORAGE_KEY = 'pista8.impersonation.session';

interface DecodedImpersonationPayload {
  uid: string;
  email: string;
  role: 'COMPANY';
  roleName: 'company';
  companyId: string;
  companyName: string;
  originalAdminUid: string;
  originalAdminEmail?: string | null;
  impersonationReadOnly: true;
  sessionMode: 'READ_ONLY';
  exp: number;
}

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  if (typeof atob === 'function') {
    return atob(padded);
  }

  throw new Error('El entorno no soporta decodificación base64 URL.');
};

const getStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);

export const decodeImpersonationToken = (token: string): ImpersonationSession => {
  const [, payloadPart] = token.split('.');
  if (!payloadPart) {
    throw new Error('Token de soporte inválido');
  }

  const payload = JSON.parse(decodeBase64Url(payloadPart)) as DecodedImpersonationPayload;

  return {
    token,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    readOnly: true,
    sessionMode: 'READ_ONLY',
    company: {
      id: payload.companyId,
      firebaseUid: payload.uid,
      email: payload.email,
      displayName: payload.companyName,
      status: 'ACTIVE',
    },
  };
};

export const getStoredImpersonationToken = () =>
  getStorage()?.getItem(IMPERSONATION_STORAGE_KEY) || null;

export const getStoredImpersonationSession = (): ImpersonationSession | null => {
  const token = getStoredImpersonationToken();
  if (!token) {
    return null;
  }

  try {
    return decodeImpersonationToken(token);
  } catch {
    getStorage()?.removeItem(IMPERSONATION_STORAGE_KEY);
    return null;
  }
};

export const setStoredImpersonationToken = (token: string) => {
  getStorage()?.setItem(IMPERSONATION_STORAGE_KEY, token);
  return decodeImpersonationToken(token);
};

export const clearStoredImpersonationToken = () => {
  getStorage()?.removeItem(IMPERSONATION_STORAGE_KEY);
};