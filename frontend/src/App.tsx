import { AuthProvider } from './context/AuthContext';
import SocketBridge from './components/SocketBridge';
import { Toaster } from 'sonner';
import { GlobalErrorBoundary } from './components/errors/GlobalErrorBoundary';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { FCMListener } from './components/FCMListener';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalErrorBoundary>
          <FCMListener />
          <SocketBridge />
          <AppRoutes />
          <Toaster
            position="top-center"
            closeButton
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
                maxWidth: 'calc(100vw - 32px)',
                wordBreak: 'break-word',
                padding: '16px 40px 16px 20px',
              },
              classNames: {
                closeButton: 'sonner-close-btn',
              }
            }}
          />
          <style>
            {`
              .sonner-close-btn {
                background: white !important;
                border: 1px solid rgba(72,80,84,0.15) !important;
                color: #64748b !important;
                top: 4px !important;
                right: 4px !important;
                left: auto !important;
                transform: none !important;
                width: 24px !important;
                height: 24px !important;
                min-width: 24px !important;
                min-height: 24px !important;
                flex-shrink: 0 !important;
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 50% !important;
              }
              .sonner-close-btn:hover {
                background: #f8fafc !important;
                color: #0f172a !important;
              }
            `}
          </style>
        </GlobalErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
