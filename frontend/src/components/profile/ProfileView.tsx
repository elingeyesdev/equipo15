import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { RoleGuard } from '../common/RoleGuard';
import { Pista8Theme } from '../../config/theme';
import { getFacultyName } from '../../config/faculties';
import LogoutButton from '../dashboard/LogoutButton';
import BackButton from '../common/BackButton';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const BackBtnWrap = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  @media (max-width: 768px) {
    position: static;
    margin-bottom: 2rem;
    align-self: flex-start;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 32px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 12px 48px rgba(72, 80, 84, 0.09);
  width: 100%;
  max-width: 640px;
  overflow: hidden;
  animation: ${fadeUp} 0.4s ease both;
`;

const ProfileBanner = styled.div`
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  padding: 52px 40px 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BannerGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

const AvatarRing = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
  padding: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${Pista8Theme.primary}60, transparent 60%);
`;

const Avatar = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 3px solid #1a1f22;
`;

const DisplayName = styled.h1`
  font-size: 26px;
  font-weight: 900;
  color: white;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
  position: relative;
  z-index: 1;
  text-align: center;
`;

const Email = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.38);
  margin: 0 0 10px;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;

const FacultyLabel = styled.p`
  font-size: 14px;
  color: ${Pista8Theme.primary};
  font-weight: 700;
  margin: 0 0 24px;
  position: relative;
  z-index: 1;
`;

const RolePill = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
`;

const CardBody = styled.div`
  padding: 44px 44px;
  display: flex;
  flex-direction: column;
  gap: 36px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionLabel = styled.p`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #b8c0c8;
  margin: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(72, 80, 84, 0.06);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px 18px;
  border: 1.5px solid rgba(72, 80, 84, 0.11);
  border-radius: 18px;
  font-size: 15px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  background: ${Pista8Theme.background};
  font-family: inherit;
  resize: vertical;
  outline: none;
  line-height: 1.7;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  &::placeholder { color: #c8d0d8; }
  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}14;
  }
`;

const SaveBtn = styled.button`
  align-self: flex-end;
  padding: 13px 28px;
  margin-top: 12px;
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: transform 0.12s, box-shadow 0.18s;
  box-shadow: 0 4px 20px ${Pista8Theme.primary}35;
  &:hover { transform: translateY(-1px); box-shadow: 0 6px 26px ${Pista8Theme.primary}48; }
  &:active { transform: scale(0.97); }
  &:disabled { background: rgba(72,80,84,0.09); color: #b8c0c8; box-shadow: none; cursor: default; transform: none; }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: ${Pista8Theme.background};
  border-radius: 18px;
  border: 1.5px solid rgba(72, 80, 84, 0.06);
`;

const InfoIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${Pista8Theme.primary}14;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const InfoKey = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: #b8c0c8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const InfoVal = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const LogoutWrap = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 4px;
`;

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile: profile, refetchProfile } = useAuth();
  const [bioInput, setBioInput] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      await userService.updateBio(bioInput);
      await refetchProfile();
      toast.success('Perfil actualizado correctamente');
    } catch (e) {
      // Error saving bio
      toast.error('Hubo un error guardando tu perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper>
      <BackBtnWrap>
        <BackButton onClick={() => navigate(-1)} />
      </BackBtnWrap>
      <Card>
        <ProfileBanner>
          <BannerGrid />
          <AvatarRing>
            <Avatar
              src={profile.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile.displayName}
              alt="Avatar"
            />
          </AvatarRing>
          <DisplayName>{profile.displayName}</DisplayName>
          <Email>{profile.email}</Email>
          {profile.facultyId && <FacultyLabel>{getFacultyName(profile.facultyId)}</FacultyLabel>}
          <RolePill>{profile.roleInfo?.description || profile.roleInfo?.name || profile.role || 'Usuario'}</RolePill>
        </ProfileBanner>

        <CardBody>
          <Section>
            <SectionLabel>Acerca de mí</SectionLabel>
            <TextArea
              value={bioInput}
              onChange={e => setBioInput(e.target.value)}
              placeholder="Escribe algo interesante sobre ti..."
            />
            <SaveBtn onClick={handleSaveBio} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </SaveBtn>
          </Section>

          <RoleGuard allowedRoles={['student']}>
            <Divider />
            <Section>
              <SectionLabel>Mis Ideas Enviadas</SectionLabel>
              <InfoList>
                <InfoItem>
                  <InfoIcon>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a7 7 0 0 1 7 7c0 3-1.8 5.4-4 6.5V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.5C6.8 14.4 5 12 5 9a7 7 0 0 1 7-7z" />
                      <line x1="9" y1="21" x2="15" y2="21" />
                    </svg>
                  </InfoIcon>
                  <InfoText>
                    <InfoKey>Ideas enviadas</InfoKey>
                    <InfoVal>Próximamente disponible</InfoVal>
                  </InfoText>
                </InfoItem>
              </InfoList>
            </Section>
          </RoleGuard>

          <RoleGuard allowedRoles={['judge']}>
            <Divider />
            <Section>
              <SectionLabel>Panel de Evaluación</SectionLabel>
              <InfoList>
                <InfoItem>
                  <InfoIcon>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </InfoIcon>
                  <InfoText>
                    <InfoKey>Especialidad</InfoKey>
                    <InfoVal>{profile.specialty || 'No definida'}</InfoVal>
                  </InfoText>
                </InfoItem>
                <InfoItem>
                  <InfoIcon>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </InfoIcon>
                  <InfoText>
                    <InfoKey>Retos pendientes</InfoKey>
                    <InfoVal>0</InfoVal>
                  </InfoText>
                </InfoItem>
              </InfoList>
            </Section>
          </RoleGuard>

          <RoleGuard allowedRoles={['admin']}>
            <Divider />
            <Section>
              <SectionLabel>Administración</SectionLabel>
              <InfoList>
                <InfoItem>
                  <InfoIcon>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </InfoIcon>
                  <InfoText>
                    <InfoKey>Rol</InfoKey>
                    <InfoVal>Administrador de Pista 8</InfoVal>
                  </InfoText>
                </InfoItem>
              </InfoList>
            </Section>
          </RoleGuard>

          <Divider />

          <LogoutWrap>
            <LogoutButton />
          </LogoutWrap>
        </CardBody>
      </Card>
    </Wrapper>
  );
};

export default ProfileView;