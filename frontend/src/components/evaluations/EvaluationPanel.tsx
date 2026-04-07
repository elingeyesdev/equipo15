import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as S from '../dashboard/styles/LayoutStyles';
import Sidebar from '../dashboard/components/Sidebar';

export const EvaluationPanel = () => {
  const { user, userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = userProfile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Jurado';

  return (
    <S.Root>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <S.Page>
        <S.Header>
          <S.WelcomeZone>
            <S.Greeting>Panel de Evaluación <span>{firstName}</span></S.Greeting>
            <S.Sub>Revisión y calificación de propuestas del Hub.</S.Sub>
          </S.WelcomeZone>

          <S.HamburgerBtn onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" />
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" />
            </svg>
          </S.HamburgerBtn>
        </S.Header>

        <div style={{ padding: '2rem', color: 'white', opacity: 0.8, animation: 'fadeIn 0.5s ease both' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Gestión de Evaluaciones</h2>
            <p>El módulo de calificación detallada estará disponible próximamente en el Sprint 1.</p>
          </div>
        </div>
      </S.Page>
    </S.Root>
  );
};

export default EvaluationPanel;
