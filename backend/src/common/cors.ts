const ALLOWED_PATTERNS: (string | RegExp)[] = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/,
  'https://pista8-f8e6e.web.app',
  'https://pista8-f8e6e.firebaseapp.com',
  'https://pista8-ideacion.francolao.workers.dev',
  'https://pista8.com',
];

export const CORS_ORIGINS = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) {
    callback(null, true);
    return;
  }
  const isAllowed = ALLOWED_PATTERNS.some(allowed => {
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return allowed === origin;
  });
  if (isAllowed) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};
