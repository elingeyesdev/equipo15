import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { NAVIGATION_CONFIG } from './navigation.config';
import { useAuth } from '../../../context/AuthContext';
import * as S from '../styles/SidebarStyles';
import LogoutButton from '../LogoutButton';

const NotificationBadge = styled.span`
  background-color: #FE410A;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { userProfile } = useAuth();
  const location = useLocation();

  if (!userProfile) return null;

  const userRole = (userProfile.roleInfo?.name || userProfile.role || '').toUpperCase();

  const filteredLinks = NAVIGATION_CONFIG.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      <S.Overlay open={isOpen} onClick={() => setIsOpen(false)} />
      <S.Sidebar open={isOpen}>
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
          <S.SidebarClose onClick={() => setIsOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </S.SidebarClose>
        </S.SidebarTop>

        <S.SidebarNav>
          <S.SidebarNavItem 
            as={RouterNavLink} 
            to="/dashboard/perfil" 
            onClick={() => setIsOpen(false)}
            className={location.pathname === '/dashboard/perfil' ? 'active' : ''}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Mi Perfil
          </S.SidebarNavItem>



          <S.SidebarDivider />

          {filteredLinks.map((item) => {
            const isActive = location.pathname.includes(item.path);
            if (item.isComingSoon) {
              return (
                <S.SidebarNavItem 
                  key={item.path}
                  onClick={(e: React.MouseEvent) => e.preventDefault()}
                  style={{ pointerEvents: 'none', opacity: 0.6 }}
                >
                  <item.icon size={20} strokeWidth={1.75} />
                  {item.name}
                  <S.ComingSoonBadge>PRÓXIMAMENTE</S.ComingSoonBadge>
                </S.SidebarNavItem>
              );
            }

            return (
              <S.SidebarNavItem 
                as={RouterNavLink}
                key={item.path}
                to={item.path}
                className={isActive ? 'active' : ''}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} strokeWidth={1.75} />
                {item.name}
                {item.badgeCount && item.badgeCount > 0 && (
                  <NotificationBadge>{item.badgeCount}</NotificationBadge>
                )}
              </S.SidebarNavItem>
            );
          })}
        </S.SidebarNav>

        <S.SidebarFooter>
          <LogoutButton />
        </S.SidebarFooter>
      </S.Sidebar>
    </>
  );
};
