import React from 'react';
import { NavLink } from 'react-router-dom';
import * as S from '../styles/AdminStyles';
import LogoutButton from '../../../dashboard/LogoutButton';

interface AdminSidebarProps {
  userProfile: any;
  activeTab: string;
  setActiveTab: (t: string) => void;
  setShowForm: (b: boolean) => void;
  setIsPreview: (b: boolean) => void;
  handleLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userProfile, activeTab, setActiveTab, setShowForm, setIsPreview, handleLogout
}) => {
  const resetVews = () => {
    setShowForm(false);
    setIsPreview(false);
  };

  return (
    <S.Sidebar>
      <div style={{ flex: 1 }}>
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

        <S.UserProfileBlock>
          <S.RoleTag>{userProfile?.roleId?.name?.toUpperCase() || userProfile?.role?.toUpperCase()}</S.RoleTag>
          <S.UserName>{userProfile?.displayName}</S.UserName>
        </S.UserProfileBlock>

        <S.SidebarNav>
          <S.NavBtn as={NavLink} to="/dashboard/perfil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Mi Perfil
          </S.NavBtn>

          <S.SidebarDivider />

          <S.NavBtn active={activeTab === 'challenges'} onClick={() => { setActiveTab('challenges'); resetVews(); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Gestión de Retos
          </S.NavBtn>
          <S.NavBtn active={activeTab === 'stats'} onClick={() => { setActiveTab('stats'); resetVews(); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Estadísticas
          </S.NavBtn>
        </S.SidebarNav>
      </div>

      <S.SidebarFooter>
        <LogoutButton onClick={handleLogout} />
      </S.SidebarFooter>
    </S.Sidebar>
  );
};

export default AdminSidebar;
