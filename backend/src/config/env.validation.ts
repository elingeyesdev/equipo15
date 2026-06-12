const DEFAULT_DATABASE_URL =
  'postgresql://user:password@localhost:5432/pista8';
const DEFAULT_PORT = 3000;

export function validateEnv(config: Record<string, unknown>) {
  const isProd = config.NODE_ENV === 'production';

  const databaseUrl = readString(config.DATABASE_URL);
  if (!databaseUrl && isProd) {
    throw new Error('DATABASE_URL es obligatoria en producción');
  }

  const firebaseProjectId = readString(config.FIREBASE_PROJECT_ID);
  if (!firebaseProjectId && isProd) {
    throw new Error('FIREBASE_PROJECT_ID es obligatorio en producción');
  }

  const firebasePrivateKey = readString(config.FIREBASE_PRIVATE_KEY);
  if (!firebasePrivateKey && isProd) {
    throw new Error('FIREBASE_PRIVATE_KEY es obligatorio en producción');
  }

  const redisUrl = readString(config.REDIS_URL);
  if (!redisUrl && isProd) {
    throw new Error('REDIS_URL es obligatorio en producción');
  }

  const port = readPort(config.PORT, DEFAULT_PORT);

  return {
    ...config,
    DATABASE_URL: databaseUrl || DEFAULT_DATABASE_URL,
    PORT: port,
  };
}

function readString(value: unknown, fallback?: string): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return fallback;
}

function readPort(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallback;
}
