import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UserProfile } from '@/types/models';
import { Pista8Theme } from '@/config/theme';
import { RoleGuard } from '@/components/common/RoleGuard';
import LogoutButton from '@/features/dashboard/components/LogoutButton';
import { formatFacultyLabel } from '@/services/faculties.service';
import {
  Divider,
  Section,
  SectionHeader,
  SectionLabel,
  SectionLine,
  InfoList,
  InfoItem,
  InfoIcon,
  InfoText,
  InfoKey,
  InfoVal,
  SecurityActions,
  GoogleLinkedBadge,
  GoogleBtn,
  PassButton,
  PassForm,
  FormRow,
  FormLabel,
  FormInput,
  InputGroup,
  EyeBtn,
  LogoutWrap,
  SaveBtn,
} from './ProfileStyles';

interface PasswordData {
  old: string;
  newPass: string;
  confirm: string;
}

interface ProfileRoleSectionsProps {
  profile: UserProfile;
  readOnlyMode: boolean;
  isGoogleLinked: boolean;
  onLinkGoogle: () => Promise<void>;
  showPassChange: boolean;
  setShowPassChange: React.Dispatch<React.SetStateAction<boolean>>;
  passData: PasswordData;
  setPassData: React.Dispatch<React.SetStateAction<PasswordData>>;
  passLoading: boolean;
  onChangePass: () => Promise<void>;
  showOld: boolean;
  setShowOld: React.Dispatch<React.SetStateAction<boolean>>;
  showNew: boolean;
  setShowNew: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirm: boolean;
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}

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

export const ProfileRoleSections: React.FC<ProfileRoleSectionsProps> = ({
  profile,
  readOnlyMode,
  isGoogleLinked,
  onLinkGoogle,
  showPassChange,
  setShowPassChange,
  passData,
  setPassData,
  passLoading,
  onChangePass,
  showOld,
  setShowOld,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
}) => {
  return (
    <>


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
                <InfoVal>
                  {profile.facultyName
                    ? formatFacultyLabel(profile.facultyName)
                    : (profile.specialty || 'No definida')}
                </InfoVal>
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
              <GoogleBtn onClick={onLinkGoogle}>
                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Vincular Cuenta de Google
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
                    onClick={onChangePass}
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
        <LogoutButton disabled={readOnlyMode} />
      </LogoutWrap>
    </>
  );
};
