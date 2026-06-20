import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as S from '../dashboard/styles/LayoutStyles';
import { Sidebar } from '../dashboard/layout/Sidebar';
import { resolveDisplayName } from '../../utils/user.utils';
import BottomNavbar from '../dashboard/components/BottomNavbar';

export const EvaluationPanel = () => {
  const { userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = resolveDisplayName(userProfile).split(' ')[0] || 'Jurado';

  return (
    <S.Root>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <S.Page>
        <S.Header>
          <S.WelcomeZone>
            <S.Greeting>Hola, <span>{firstName}</span></S.Greeting>
            <S.Sub>Revisión y calificación de propuestas del Hub.</S.Sub>
          </S.WelcomeZone>
        </S.Header>

        <div style={{ padding: '2rem', color: 'white', opacity: 0.8, animation: 'fadeIn 0.5s ease both' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Gestión de Evaluaciones</h2>
            <p>El módulo de calificación detallada estará disponible próximamente en el Sprint 1.</p>
          </div>
        </div>
      </S.Page>
      <BottomNavbar />
    </S.Root>
  );
};

export default EvaluationPanel;
