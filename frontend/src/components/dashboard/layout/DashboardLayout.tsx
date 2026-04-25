import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NAVIGATION_CONFIG } from './navigation.config';
import { useAuth } from '../../../context/AuthContext';
import * as S from '../styles/LayoutStyles';
import { resolveDisplayName } from '../../../utils/user.utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { userProfile } = useAuth();

  const pageTitle = useMemo(() => {
    const matchedItem = NAVIGATION_CONFIG.find((item) =>
      location.pathname.includes(item.path)
    );
    return matchedItem ? matchedItem.name : 'Dashboard';
  }, [location.pathname]);

  const resolvedName = resolveDisplayName(userProfile as any);

  const roleName: string = (userProfile?.roleInfo?.name || userProfile?.role || '').toLowerCase();
  const roleLabels: Record<string, string> = {
    admin: 'administrador',
    company: 'empresa',
    judge: 'jurado',
  };
  const userRole = roleLabels[roleName] || 'usuario';

  return (
    <S.Root>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <S.Page>
        <S.Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" width="110" height="28">
              <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#1a1f22" letterSpacing="-2">PIST</text>
              <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
              <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#1a1f22">8</text>
            </svg>
            <S.WelcomeZone>
              <S.Greeting>Hola, {userRole} <span>{resolvedName}</span></S.Greeting>
              <S.Sub>{pageTitle}</S.Sub>
            </S.WelcomeZone>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <S.HamburgerBtn onClick={() => setIsSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" />
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" />
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" />
              </svg>
            </S.HamburgerBtn>
          </div>
        </S.Header>
        
        <S.FullWidthContainer>
          {children}
        </S.FullWidthContainer>
      </S.Page>
    </S.Root>
  );
};
