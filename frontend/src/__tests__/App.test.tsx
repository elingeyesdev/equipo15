/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import App from '../App';


vi.mock('../context/AuthContext', () => {
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
    useAuth: () => ({ user: null }),
  };
});

describe('App Root y ErrorBoundary', () => {
  it('renderiza la aplicación base sin fallar', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });
});
