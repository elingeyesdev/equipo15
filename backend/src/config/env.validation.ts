const DEFAULT_DATABASE_URL =
  'postgresql://user:password@localhost:5432/pista8';
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/pista8';
const DEFAULT_PORT = 3000;

export function validateEnv(config: Record<string, unknown>) {
  const databaseUrl = readString(
    config.DATABASE_URL,
    DEFAULT_DATABASE_URL,
  );
  const mongoUri = readString(config.MONGO_URI, DEFAULT_MONGO_URI);
  const port = readPort(config.PORT, DEFAULT_PORT);

  return {
    ...config,
    DATABASE_URL: databaseUrl,
    MONGO_URI: mongoUri,
    PORT: port,
  };
}

function readString(value: unknown, fallback: string): string {
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
