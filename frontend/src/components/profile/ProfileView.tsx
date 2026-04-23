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
import { authService } from '../../services/auth.service';
import { AnimatePresence, motion } from 'framer-motion';

const PROFILE_CONFIGS: Record<string, { badge: string; showCode: boolean; bioPlaceholder: string }> = {
  student: { badge: "INNOVADOR", showCode: true, bioPlaceholder: "Cuéntanos sobre tus pasiones..." },
  company: { badge: "EMPRESA SOCIA", showCode: false, bioPlaceholder: "Descripción de la institución o área..." },
  judge: { badge: "EXPERTO EVALUADOR", showCode: false, bioPlaceholder: "Resumen de tu expertise técnico..." },
  admin: { badge: "SOPORTE TÉCNICO", showCode: false, bioPlaceholder: "Notas de administración..." }
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  padding: 4rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const BackBtnWrap = styled.div`
  position: absolute;
  top: 2.25rem;
  left: 2.25rem;
  @media (max-width: 768px) {
    position: static;
    margin-bottom: 1.75rem;
    align-self: flex-start;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(72, 80, 84, 0.07);
  box-shadow:
    0 1px 2px rgba(72, 80, 84, 0.04),
    0 8px 32px rgba(72, 80, 84, 0.08),
    0 24px 64px rgba(72, 80, 84, 0.06);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  animation: ${fadeUp} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

const ProfileBanner = styled.div`
  background: linear-gradient(150deg, #1e2529 0%, #161b1e 100%);
  padding: 48px 40px 36px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BannerNoise = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.02) 0%, transparent 40%);
  pointer-events: none;
`;

const BannerGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
`;

const AvatarWrap = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
`;

const AvatarRing = styled.div`
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${Pista8Theme.primary}70 0%, transparent 60%);
`;

const Avatar = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 3px solid #161b1e;
`;

const BannerMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
`;

const DisplayName = styled.h1`
  font-size: 24px;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.4px;
`;

const Email = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.32);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const BannerPills = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: center;
`;

const FacultyPill = styled.span`
  font-size: 12px;
  color: ${Pista8Theme.primary};
  font-weight: 700;
  background: ${Pista8Theme.primary}18;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid ${Pista8Theme.primary}30;
`;

const RolePill = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.08);
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const CardBody = styled.div`
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionLabel = styled.p`
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #bbc4cc;
  margin: 0;
`;

const SectionLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgba(72, 80, 84, 0.08);
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(72, 80, 84, 0.07);
  margin: 0 -40px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const FieldFull = styled.div`
  grid-column: 1 / -1;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 11px;
  font-weight: 700;
  color: #a8b2ba;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  background: ${Pista8Theme.background};
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;

  &::placeholder { color: #c8d0d8; }
  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}12;
    background: #ffffff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  background: ${Pista8Theme.background};
  font-family: inherit;
  resize: vertical;
  outline: none;
  line-height: 1.65;
  box-sizing: border-box;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;

  &::placeholder { color: #c8d0d8; }
  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}12;
    background: #ffffff;
  }
`;

const PhoneInputWrap = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;

  input {
    border-radius: 0 12px 12px 0;
    border-left: none;
    &:focus { border-left: none; }
  }
`;

const PhonePrefix = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 13px;
  background: rgba(72, 80, 84, 0.04);
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-right: none;
  border-radius: 12px 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #6e7880;
  white-space: nowrap;
`;

const SaveBtn = styled.button`
  align-self: flex-end;
  padding: 12px 24px;
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: transform 0.1s, box-shadow 0.18s, opacity 0.18s;
  box-shadow: 0 4px 16px ${Pista8Theme.primary}38;

  &:hover { transform: translateY(-1px); box-shadow: 0 6px 22px ${Pista8Theme.primary}48; }
  &:active { transform: scale(0.97); }
  &:disabled {
    background: rgba(72,80,84,0.08);
    color: #b8c0c8;
    box-shadow: none;
    cursor: default;
    transform: none;
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: ${Pista8Theme.background};
  border-radius: 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.06);
  transition: border-color 0.18s;

  &:hover { border-color: rgba(72, 80, 84, 0.12); }
`;

const InfoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${Pista8Theme.primary}12;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoKey = styled.p`
  font-size: 10.5px;
  font-weight: 700;
  color: #b8c0c8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const InfoVal = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const SecurityActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GoogleLinkedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34A853;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  background: rgba(52, 168, 83, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(52, 168, 83, 0.14);
  width: fit-content;
  animation: ${slideDown} 0.25s ease both;
`;

const GoogleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  width: fit-content;

  &:hover {
    background: #f5f7f9;
    border-color: rgba(66, 133, 244, 0.4);
    box-shadow: 0 2px 10px rgba(66, 133, 244, 0.1);
  }
`;

const PassButton = styled.button`
  background: none;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  font-size: 13.5px;
  color: ${Pista8Theme.secondary};
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  width: fit-content;
  transition: all 0.18s;

  &:hover {
    border-color: ${Pista8Theme.primary}50;
    color: ${Pista8Theme.primary};
    background: ${Pista8Theme.primary}06;
  }
`;

const PassForm = styled.div`
  background: ${Pista8Theme.background};
  padding: 20px;
  border-radius: 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.07);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const EyeBtn = styled.button`
  position: absolute;
  right: 11px;
  background: none;
  border: none;
  color: #c4cdd5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.18s;

  &:hover { color: ${Pista8Theme.primary}; }
  svg { width: 16px; height: 16px; }
`;

const LogoutWrap = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 4px;
`;

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile: profile, refetchProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    bio: profile?.bio || '',
    nickname: profile?.nickname || '',
    phone: profile?.phone || '',
    studentCode: profile?.studentCode || '',
  });
  const [saving, setSaving] = useState(false);
  const [showPassChange, setShowPassChange] = useState(false);
  const [passData, setPassData] = useState({ old: '', newPass: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!profile || !user) return null;

  const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userService.updateProfile(profileData);
      await refetchProfile();
      toast.success('Perfil actualizado correctamente');
    } catch (e) {
      toast.error('Hubo un error guardando tu perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      await authService.linkGoogleAccount();
      toast.success('Cuenta de Google vinculada correctamente');
      window.location.reload();
    } catch (e: any) {
      if (e.code === 'auth/credential-already-in-use') {
        toast.error('Esta cuenta de Google ya está vinculada a otro usuario.');
      } else {
        toast.error('Error al vincular con Google.');
      }
    }
  };

  const handleChangePass = async () => {
    if (!passData.old || !passData.newPass || !passData.confirm) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (passData.newPass !== passData.confirm) {
      toast.error('Las nuevas contraseñas no coinciden');
      return;
    }
    setPassLoading(true);
    try {
      await authService.changePassword(passData.old, passData.newPass);
      toast.success('Contraseña actualizada correctamente');
      setShowPassChange(false);
      setPassData({ old: '', newPass: '', confirm: '' });
    } catch (e: any) {
      if (e.code === 'auth/wrong-password') {
        toast.error('La contraseña actual es incorrecta');
      } else {
        toast.error('Error al actualizar la contraseña');
      }
    } finally {
      setPassLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <Wrapper>
      <BackBtnWrap>
        <BackButton onClick={() => navigate(-1)} />
      </BackBtnWrap>

      <Card>
        <ProfileBanner>
          <BannerGrid />
          <BannerNoise />
          <AvatarWrap>
            <AvatarRing>
              <Avatar
                src={profile.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile.displayName}
                alt="Avatar"
              />
            </AvatarRing>
          </AvatarWrap>
          <BannerMeta>
            <DisplayName>{profile.displayName}</DisplayName>
            <Email>{profile.email}</Email>
            <BannerPills>
              {profile.facultyId && <FacultyPill>{getFacultyName(profile.facultyId)}</FacultyPill>}
              <RolePill>{PROFILE_CONFIGS[profile.role || 'student']?.badge || 'Usuario'}</RolePill>
            </BannerPills>
          </BannerMeta>
        </ProfileBanner>

        <CardBody>
          <Section>
            <SectionHeader>
              <SectionLabel>Identidad en Pista 8</SectionLabel>
              <SectionLine />
            </SectionHeader>

            <FieldGrid>
              <FormRow>
                <FormLabel>Nickname</FormLabel>
                <FormInput
                  type="text"
                  value={profileData.nickname}
                  onChange={e => setProfileData({ ...profileData, nickname: e.target.value })}
                  placeholder="ViajeroEstelar"
                />
              </FormRow>
              <FormRow>
                <FormLabel>Teléfono</FormLabel>
                <PhoneInputWrap>
                  <PhonePrefix>+591</PhonePrefix>
                  <FormInput
                    type="tel"
                    value={profileData.phone ? profileData.phone.replace('+591', '') : ''}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setProfileData({ ...profileData, phone: digits ? `+591${digits}` : '' });
                    }}
                    placeholder="70000000"
                  />
                </PhoneInputWrap>
              </FormRow>
              {PROFILE_CONFIGS[profile.role || 'student']?.showCode && (
                <FieldFull>
                  <FormRow>
                    <FormLabel>Código Estudiantil</FormLabel>
                    <FormInput
                      type="text"
                      value={profileData.studentCode}
                      onChange={e => setProfileData({ ...profileData, studentCode: e.target.value.toUpperCase() })}
                      placeholder="Opcional"
                    />
                  </FormRow>
                </FieldFull>
              )}
              <FieldFull>
                <FormRow>
                  <FormLabel>Acerca de mí</FormLabel>
                  <TextArea
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder={PROFILE_CONFIGS[profile.role || 'student']?.bioPlaceholder || "Escribe algo interesante sobre ti..."}
                  />
                </FormRow>
              </FieldFull>
            </FieldGrid>

            <SaveBtn onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </SaveBtn>
          </Section>

          <RoleGuard allowedRoles={['student']}>
            <Divider />
            <Section>
              <SectionHeader>
                <SectionLabel>Mis Ideas Enviadas</SectionLabel>
                <SectionLine />
              </SectionHeader>
              <InfoList>
                <InfoItem>
                  <InfoIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <SectionHeader>
                <SectionLabel>Panel de Evaluación</SectionLabel>
                <SectionLine />
              </SectionHeader>
              <InfoList>
                <InfoItem>
                  <InfoIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <SectionHeader>
                <SectionLabel>Administración</SectionLabel>
                <SectionLine />
              </SectionHeader>
              <InfoList>
                <InfoItem>
                  <InfoIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          <Section>
            <SectionHeader>
              <SectionLabel>Seguridad</SectionLabel>
              <SectionLine />
            </SectionHeader>

            <SecurityActions>
              <RoleGuard allowedRoles={['student']}>
                {!isGoogleLinked ? (
                  <GoogleBtn onClick={handleLinkGoogle}>
                    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Vincular cuenta de Google
                  </GoogleBtn>
                ) : (
                  <GoogleLinkedBadge>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Acceso con Google vinculado
                  </GoogleLinkedBadge>
                )}
              </RoleGuard>

              <PassButton onClick={() => setShowPassChange(!showPassChange)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Cambiar contraseña
              </PassButton>

              <AnimatePresence>
                {showPassChange && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <PassForm>
                      <FormRow>
                        <FormLabel>Contraseña actual</FormLabel>
                        <InputGroup>
                          <FormInput
                            type={showOld ? 'text' : 'password'}
                            placeholder="Tu clave actual"
                            value={passData.old}
                            style={{ paddingRight: '40px' }}
                            onChange={e => setPassData({ ...passData, old: e.target.value })}
                          />
                          <EyeBtn type="button" onClick={() => setShowOld(!showOld)}>
                            {showOld ? <EyeOffIcon /> : <EyeIcon />}
                          </EyeBtn>
                        </InputGroup>
                      </FormRow>
                      <FormRow>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <InputGroup>
                          <FormInput
                            type={showNew ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            value={passData.newPass}
                            style={{ paddingRight: '40px' }}
                            onChange={e => setPassData({ ...passData, newPass: e.target.value })}
                          />
                          <EyeBtn type="button" onClick={() => setShowNew(!showNew)}>
                            {showNew ? <EyeOffIcon /> : <EyeIcon />}
                          </EyeBtn>
                        </InputGroup>
                      </FormRow>
                      <FormRow>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <InputGroup>
                          <FormInput
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Repite la nueva clave"
                            value={passData.confirm}
                            style={{ paddingRight: '40px' }}
                            onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                          />
                          <EyeBtn type="button" onClick={() => setShowConfirm(!showConfirm)}>
                            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                          </EyeBtn>
                        </InputGroup>
                      </FormRow>
                      <SaveBtn
                        onClick={handleChangePass}
                        disabled={passLoading}
                        style={{ width: '100%', marginTop: '4px' }}
                      >
                        {passLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                      </SaveBtn>
                    </PassForm>
                  </motion.div>
                )}
              </AnimatePresence>
            </SecurityActions>
          </Section>

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