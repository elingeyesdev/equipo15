import { vi } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    setPersistence: vi.fn(),
  })),
  GoogleAuthProvider: vi.fn(),
  browserSessionPersistence: 'session',
  setPersistence: vi.fn(),
}));

vi.mock('./config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  googleProvider: {},
}));
