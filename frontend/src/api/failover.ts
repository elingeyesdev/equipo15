const DEFAULT_API_URL = 'http://localhost:3000/api';

const normalizeApiUrl = (url: string): string => {
  return url.replace(/\/api\/?$/, '/api');
};

export const PRIMARY_API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL);
export const BACKUP_API_URL = import.meta.env.VITE_BACKUP_API_URL
  ? normalizeApiUrl(import.meta.env.VITE_BACKUP_API_URL)
  : '';

const STORAGE_KEY = 'pista8_active_api_url';

let activeApiUrl = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === PRIMARY_API_URL || saved === BACKUP_API_URL)) {
      return saved;
    }
  }
  return PRIMARY_API_URL;
})();

export function getActiveApiUrl(): string {
  return activeApiUrl;
}

export function getActiveSocketUrl(): string {
  return activeApiUrl.replace(/\/api\/?$/, '');
}

export function switchToBackup(): boolean {
  if (BACKUP_API_URL && activeApiUrl !== BACKUP_API_URL) {
    console.warn(`[Failover] Switching active API to backup: ${BACKUP_API_URL}`);
    activeApiUrl = BACKUP_API_URL;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, BACKUP_API_URL);
    }
    return true;
  }
  return false;
}

export function switchToPrimary(): boolean {
  if (activeApiUrl !== PRIMARY_API_URL) {
    console.log(`[Failover] Reverting active API to primary: ${PRIMARY_API_URL}`);
    activeApiUrl = PRIMARY_API_URL;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return true;
  }
  return false;
}
