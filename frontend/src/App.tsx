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
            toastOptions={{
              style: {
                background: '#1a1f22',
                color: 'white',
                border: '1px solid rgba(254,65,10,0.25)',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              },
            }}
          />
        </GlobalErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
