const DEFAULT_API_URL = 'http://localhost:3000/api';

function normalizeApiUrl(url: string): string {
	return url.replace(/\/api\/?$/, '/api');
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL);
