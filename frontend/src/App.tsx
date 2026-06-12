import { AuthProvider } from './context/AuthContext';
import SocketBridge from './components/SocketBridge';
import { Toaster } from 'sonner';
import { GlobalErrorBoundary } from './components/errors/GlobalErrorBoundary';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalErrorBoundary>
          <SocketBridge />
          <AppRoutes />
          <Toaster
            position="top-center"
            style={{ zIndex: 99999 }}
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#1a1f22',
                border: '1px solid rgba(72,80,84,0.15)',
                borderLeft: '5px solid #FE410A',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                width: 'auto',
                minWidth: '280px',
                padding: '16px 20px',
              },
            }}
          />
        </GlobalErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
