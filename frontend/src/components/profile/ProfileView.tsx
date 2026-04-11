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

const GoogleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 16px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;

  &:hover {
    background: #f8f9fa;
    border-color: #4285F4;
  }
`;

const PassButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: ${Pista8Theme.primary};
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  margin-top: 4px;
  width: fit-content;

  &:hover { opacity: 0.8; }
`;

const PassForm = styled.div`
  background: #f8f9fa;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: #9aa0a6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FormInput = styled.input`
  flex: 1;
  padding: 12px 14px;
  padding-right: 44px;
  border: 1.5px solid rgba(72, 80, 84, 0.1);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus { border-color: ${Pista8Theme.primary}; }
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const EyeBtn = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #b8c0c8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.2s;

  &:hover { color: ${Pista8Theme.primary}; }
  svg { width: 18px; height: 18px; }
`;

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile: profile, refetchProfile } = useAuth();
  const [bioInput, setBioInput] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [showPassChange, setShowPassChange] = useState(false);
  const [passData, setPassData] = useState({ old: '', newPass: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!profile || !user) return null;

  const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      await userService.updateBio(bioInput);
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

          <Section>
            <SectionLabel>Seguridad</SectionLabel>
            <RoleGuard allowedRoles={['student']}>
              {!isGoogleLinked ? (
                <GoogleBtn onClick={handleLinkGoogle}>
                  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Vincular cuenta de Google
                </GoogleBtn>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34A853', fontSize: '13px', fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Acceso con Google vinculado
                </div>
              )}
            </RoleGuard>

            <PassButton onClick={() => setShowPassChange(!showPassChange)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <PassForm
                    as={motion.div}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FormRow>
                      <FormLabel>Contraseña actual</FormLabel>
                      <InputGroup>
                        <FormInput
                          type={showOld ? "text" : "password"}
                          placeholder="Tu clave actual"
                          value={passData.old}
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
                          type={showNew ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          value={passData.newPass}
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
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repite la nueva clave"
                          value={passData.confirm}
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
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      {passLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </SaveBtn>
                  </PassForm>
                </motion.div>
              )}
            </AnimatePresence>
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