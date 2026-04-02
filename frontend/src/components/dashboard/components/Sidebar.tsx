import React from 'react';
import * as S from '../styles/DashboardStyles';
import LogoutButton from '../LogoutButton';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
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
          <S.SidebarNavItem active>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Ver Retos
          </S.SidebarNavItem>
          <S.SidebarNavItem>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Mis Ideas
          </S.SidebarNavItem>
        </S.SidebarNav>

        <S.SidebarFooter>
          <LogoutButton />
        </S.SidebarFooter>
      </S.Sidebar>
    </>
  );
};

export default Sidebar;
