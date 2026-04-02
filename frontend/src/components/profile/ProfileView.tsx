import React, { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/auth.service';
import { RoleGuard } from '../common/RoleGuard';
import { Pista8Theme } from '../../config/theme';

const Wrapper = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  background: ${Pista8Theme.background};
`;

const UserInfo = styled.div`
  flex: 1;

  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }
`;

const Name = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${Pista8Theme.secondary};
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${Pista8Theme.primary};
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
  text-transform: capitalize;
`;

const Section = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: ${Pista8Theme.secondary};
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LogoutButton = styled(Button)`
  background: transparent;
  color: #e53e3e;
  border: 1px solid #e53e3e;
  margin-top: 2rem;
  
  &:hover {
    background: #fff5f5;
  }
`;

import { userService } from '../../services/user.service';

export const ProfileView: React.FC = () => {
  const { profile, refetchProfile } = useUser();
  const [bioInput, setBioInput] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      await userService.updateBio(bioInput);
      await refetchProfile();
      alert("Perfil actualizado correctamente");
    } catch (e) {
       console.error("Error saving bio", e);
       alert("Hubo un error guardando tu perfil");
    } finally {
       setSaving(false);
    }
  };

  return (
    <Wrapper>
      <Header>
        <Avatar src={profile.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile.displayName} alt="Avatar" />
        <UserInfo>
          <Name>{profile.displayName}</Name>
          <p style={{ margin: '0.25rem 0', color: '#666' }}>{profile.email}</p>
          <RoleBadge>{profile.roleId?.description || profile.roleId?.name}</RoleBadge>
        </UserInfo>
      </Header>

      <Section>
        <SectionTitle>Acerca de mí (Bio)</SectionTitle>
        <TextArea 
          value={bioInput} 
          onChange={(e) => setBioInput(e.target.value)}
          placeholder="Escribe algo interesante sobre ti..."
        />
        <Button onClick={handleSaveBio} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Perfil'}
        </Button>
      </Section>

      <RoleGuard allowedRoles={['student']}>
        <Section>
          <SectionTitle>Mis Ideas Enviadas</SectionTitle>
          <p>Listado de ideas enviadas por el alumno...</p>
          {/* Aquí iría la integración con los retos o ideas correspondientes */}
        </Section>
      </RoleGuard>

      <RoleGuard allowedRoles={['judge']}>
        <Section>
          <SectionTitle>Panel de Evaluación (Experto)</SectionTitle>
          <p>Especialidad: {profile.specialty || 'No definida'}</p>
          <p>Retos pendientes: 0</p>
        </Section>
      </RoleGuard>

      <RoleGuard allowedRoles={['admin']}>
        <Section>
          <SectionTitle>Panel de Administración</SectionTitle>
          <p>Eres administrador de Pista 8.</p>
        </Section>
      </RoleGuard>

      <LogoutButton onClick={() => authService.logout()}>
        Cerrar Sesión
      </LogoutButton>
    </Wrapper>
  );
};
