import { createHmac, timingSafeEqual } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface ImpersonationTokenPayload {
  tokenType: 'impersonation';
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
  aud: 'pista8-admin-support';
  iss: 'pista8-admin-support';
  iat: number;
  exp: number;
}

export interface ImpersonationTokenResult {
  token: string;
  expiresAt: string;
  payload: ImpersonationTokenPayload;
}

const TOKEN_AUDIENCE = 'pista8-admin-support';
const DEFAULT_TTL_SECONDS = 60 * 60;

const base64UrlEncode = (value: Buffer | string) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const base64UrlDecode = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
    'utf8',
  );

let cachedSecret: string | null = null;

const getImpersonationSecret = () => {
  if (cachedSecret) return cachedSecret;

  // Opción 1: Desde variable de entorno (recomendado)
  const envSecret = process.env.IMPERSONATION_SECRET;
  if (envSecret) {
    cachedSecret = envSecret;
    return cachedSecret;
  }

  // Opción 2: Desde FIREBASE_ADMIN_CONFIG o firebase-admin.json (fallback, solo para dev)
  try {
    let serviceAccount: { private_key?: string; project_id?: string };
    if (process.env.FIREBASE_ADMIN_CONFIG) {
      serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);
    } else {
      serviceAccount = JSON.parse(
        readFileSync(join(process.cwd(), 'firebase-admin.json'), 'utf8'),
      ) as { private_key?: string; project_id?: string };
    }
    cachedSecret = [serviceAccount.project_id, serviceAccount.private_key]
      .filter(Boolean)
      .join('::');
    return cachedSecret;
  } catch {
    // Opción 3: Dev fallback
    if (process.env.NODE_ENV !== 'production') {
      cachedSecret = 'pista8-admin-support-dev-secret';
      return cachedSecret;
    }
    throw new Error('IMPERSONATION_SECRET no configurada en producción');
  }
};

const sign = (input: string) =>
  createHmac('sha256', getImpersonationSecret())
    .update(input)
    .digest('base64url');

export const createImpersonationToken = (
  payload: Omit<
    ImpersonationTokenPayload,
    | 'tokenType'
    | 'aud'
    | 'iss'
    | 'iat'
    | 'exp'
    | 'impersonationReadOnly'
    | 'sessionMode'
  >,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): ImpersonationTokenResult => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const tokenPayload: ImpersonationTokenPayload = {
    ...payload,
    tokenType: 'impersonation',
    impersonationReadOnly: true,
    sessionMode: 'READ_ONLY',
    aud: TOKEN_AUDIENCE,
    iss: TOKEN_AUDIENCE,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = sign(`${header}.${encodedPayload}`);

  return {
    token: `${header}.${encodedPayload}.${signature}`,
    expiresAt: new Date(tokenPayload.exp * 1000).toISOString(),
    payload: tokenPayload,
  };
};

export const verifyImpersonationToken = (
  token: string,
): ImpersonationTokenPayload => {
  const [headerPart, payloadPart, signaturePart] = token.split('.');

  if (!headerPart || !payloadPart || !signaturePart) {
    throw new Error('Token de impersonación mal formado');
  }

  const expectedSignature = sign(`${headerPart}.${payloadPart}`);
  const received = Buffer.from(signaturePart);
  const expected = Buffer.from(expectedSignature);

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    throw new Error('Firma de impersonación inválida');
  }

  const payload = JSON.parse(
    base64UrlDecode(payloadPart),
  ) as ImpersonationTokenPayload;

  if (
    payload.tokenType !== 'impersonation' ||
    payload.aud !== TOKEN_AUDIENCE ||
    payload.iss !== TOKEN_AUDIENCE ||
    !payload.impersonationReadOnly ||
    payload.sessionMode !== 'READ_ONLY'
  ) {
    throw new Error('Token de impersonación inválido');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error('Token de impersonación expirado');
  }

  return payload;
};
