import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { NAVIGATION_CONFIG } from './navigation.config';
import { useAuth } from '../../../context/AuthContext';
import * as S from '../styles/SidebarStyles';
import LogoutButton from '../components/LogoutButton';
import Pista8Logo from '../../../components/icons/Pista8Logo';

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
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { userProfile } = useAuth();
  const location = useLocation();

  if (!userProfile) return null;

  const userRole = (userProfile.roleInfo?.name || userProfile.role || '').toUpperCase();

  const filteredLinks = NAVIGATION_CONFIG.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      <S.Overlay open={open} onClick={onClose} />
      <S.Sidebar open={open}>
        <S.SidebarTop>
          <S.SidebarBrand>
            <Pista8Logo fill="#FFFFFF" accent="#FE410A" />
          </S.SidebarBrand>
          <S.SidebarClose onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </S.SidebarClose>
        </S.SidebarTop>

        <S.SidebarNav>
          <S.SidebarNavItem 
            as={RouterLink} 
            to="/dashboard/perfil" 
            onClick={() => onClose()}
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
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
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
                as={RouterLink}
                key={item.path}
                to={item.path}
                className={isActive ? 'active' : ''}
                onClick={() => onClose()}
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
