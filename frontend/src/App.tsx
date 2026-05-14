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
          <Toaster richColors position="top-right" />
        </GlobalErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
