import React from 'react';
import { NavLink } from 'react-router-dom';
import * as S from '../styles/SidebarStyles';
import LogoutButton from '../LogoutButton';
import { useAuth } from '../../../context/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { userProfile } = useAuth();
  const role = (userProfile?.roleId?.name || userProfile?.role || '').toLowerCase();

  return (
    <>
      <S.Overlay open={open} onClick={onClose} />
      <S.Sidebar open={open}>
        <S.SidebarTop>
          <S.SidebarBrand>
            <svg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" width="110" height="28">
              <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white" letterSpacing="-2">PIST</text>
              <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
              <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white">8</text>
            </svg>
          </S.SidebarBrand>
          <S.SidebarClose onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </S.SidebarClose>
        </S.SidebarTop>

        <S.SidebarNav>
          <S.SidebarNavItem as={NavLink} to="/dashboard/perfil" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Mi Perfil
          </S.SidebarNavItem>

          <S.SidebarDivider />

          {role === 'judge' && (
            <S.SidebarNavItem as={NavLink} to="/dashboard" end onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Panel de Evaluación
            </S.SidebarNavItem>
          )}

          {(role === 'admin' || role === 'company') && (
            <S.SidebarNavItem as={NavLink} to="/dashboard" end onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Administración
            </S.SidebarNavItem>
          )}

          {role === 'student' && (
            <>
              <S.SidebarNavItem as={NavLink} to="/dashboard" end onClick={onClose}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Ver Retos
              </S.SidebarNavItem>

              <S.SidebarNavItem as={NavLink} to="/dashboard/mis-ideas" onClick={onClose} style={{ pointerEvents: 'none', opacity: 0.4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 3-1.8 5.4-4 6.5V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.5C6.8 14.4 5 12 5 9a7 7 0 0 1 7-7z" />
                  <line x1="9" y1="21" x2="15" y2="21" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                Mis Ideas
                <S.ComingSoonBadge>Próximamente</S.ComingSoonBadge>
              </S.SidebarNavItem>
            </>
          )}
        </S.SidebarNav>

        <S.SidebarFooter>
          <LogoutButton />
        </S.SidebarFooter>
      </S.Sidebar>
    </>
  );
};

export default Sidebar;
