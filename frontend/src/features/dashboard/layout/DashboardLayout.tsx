import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NAVIGATION_CONFIG } from './navigation.config';
import { useAuth } from '../../../context/AuthContext';
import * as S from '../styles/LayoutStyles';
import { resolveDisplayName } from '../../../utils/user.utils';
import PenaltyBanner from '../../../components/common/PenaltyBanner';
import Pista8Logo from '../../../components/icons/Pista8Logo';
import { NotificationBell } from '../../../components/common/NotificationBell';
import BottomNavbar from '../components/BottomNavbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, impersonationSession, clearImpersonationSession } = useAuth();

  const handleExitMirrorMode = async () => {
    await clearImpersonationSession();
    navigate('/dashboard/admin/clients', { replace: true });
  };

  const pageTitle = useMemo(() => {
    const matchedItem = NAVIGATION_CONFIG.find((item) =>
      location.pathname.includes(item.path)
    );
    return matchedItem ? matchedItem.name : 'Dashboard';
  }, [location.pathname]);

  const resolvedName = resolveDisplayName(userProfile);



  return (
    <S.Root>
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <S.Page>
        <PenaltyBanner />
        <AnimatePresence>
          {impersonationSession && (
            <motion.div
              key="support-banner-wrapper"
              initial={{ height: 'auto', opacity: 1 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <S.SupportBanner>
                <S.SupportBannerCopy>
                  <S.SupportBannerBadge>Modo espejo</S.SupportBannerBadge>
                  <S.SupportBannerTitle>
                    Estás viendo la plataforma como {impersonationSession.company.displayName}
                  </S.SupportBannerTitle>
                  <S.SupportBannerText>
                    La sesión está bloqueada para escritura. Puedes revisar información y volver a tu cuenta de admin cuando termines.
                  </S.SupportBannerText>
                </S.SupportBannerCopy>
                <S.SupportBannerActions>
                  <S.SupportBannerButton type="button" onClick={() => void handleExitMirrorMode()}>
                    Salir del modo espejo
                  </S.SupportBannerButton>
                </S.SupportBannerActions>
              </S.SupportBanner>
            </motion.div>
          )}
        </AnimatePresence>
        <S.Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Pista8Logo fill="#1a1f22" accent="#FE410A" />
            <S.WelcomeZone>
              <S.Greeting>Hola, <span>{resolvedName}</span></S.Greeting>
              <S.Sub>{pageTitle}</S.Sub>
            </S.WelcomeZone>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NotificationBell />
          </div>
        </S.Header>
        
        <S.FullWidthContainer>
          {children}
        </S.FullWidthContainer>
        <BottomNavbar />
      </S.Page>
    </S.Root>
  );
};
