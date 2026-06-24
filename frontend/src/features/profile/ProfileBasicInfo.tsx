import React, { useState } from 'react';
import { formatFacultyLabel } from '@/services/faculties.service';
import {
  Section,
  SectionHeader,
  SectionLabel,
  SectionLine,
  FieldGrid,
  FieldFull,
  FormRow,
  FormLabel,
  FormInput,
  PhoneInputWrap,
  PhonePrefix,
  SaveBtn,
  SaveBtnWrapper,
} from './ProfileStyles';

export interface BasicInfoData {
  bio: string;
  nickname: string;
  phone: string;
  isStudent: boolean;
  studentCode: string;
  specialty: string;
}

interface ProfileBasicInfoProps {
  profileData: BasicInfoData;
  setProfileData: React.Dispatch<React.SetStateAction<BasicInfoData>>;
  saving: boolean;
  readOnlyMode: boolean;
  onSave: () => Promise<void>;
  countWords: (text: string) => number;
  profile?: any;
  dbFaculties?: any[];
}

export const ProfileBasicInfo: React.FC<ProfileBasicInfoProps> = ({
  profileData,
  setProfileData,
  saving,
  readOnlyMode,
  onSave,
  countWords,
  profile,
  dbFaculties = [],
}) => {
  const [phoneErr, setPhoneErr] = useState('');

  const validatePhone = (digits: string) => {
    if (digits.length > 0 && digits.length !== 8) {
      setPhoneErr(`Tu número debe tener exactamente 8 dígitos. Te faltan ${8 - digits.length}.`);
    } else {
      setPhoneErr('');
    }
  };

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 8) {
      setProfileData({ ...profileData, phone: digits ? `+591${digits}` : '' });
      validatePhone(digits);
    }
  };

  const status = (profile?.status || 'activo').toLowerCase();
  const penaltyUntil = profile?.penaltyUntil;

  const rawRole = typeof profile?.role === 'string' ? profile.role : profile?.roleInfo?.name || profile?.role;
  const role = (rawRole || '').toString().toLowerCase();
  const isAdmin = role === 'admin';
  const isCompany = role === 'company' || role === 'organization';
  const isJudge = role === 'judge';

  let stateConfig = {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    title: 'Estado de la Cuenta: Activa',
    desc: 'No tienes restricciones. Tu voz en el mural tiene el peso máximo de interacción.',
    borderColor: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.05)'
  };

  if (status === 'suspendido' || status === 'suspended') {
    stateConfig = {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>,
      title: 'Estado de la Cuenta: Suspendida',
      desc: 'Tu cuenta ha sido inhabilitada por un administrador. Ponte en contacto con soporte de Pista 8 para más información.',
      borderColor: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.05)'
    };
  } else if (status === 'restringido' || status === 'restricted') {
    let timeStr = '...';
    if (penaltyUntil) {
      const d = new Date(penaltyUntil._seconds ? penaltyUntil._seconds * 1000 : penaltyUntil);
      timeStr = d.toLocaleString('es');
    }
    stateConfig = {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>,
      title: 'Estado de la Cuenta: Modo Solo Lectura',
      desc: `Penalización activa por incumplimiento de normas. Podrás interactuar nuevamente en: ${timeStr}.`,
      borderColor: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.05)'
    };
  } else if (status === 'advertencia' || status === 'warning') {
    stateConfig = {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
      title: 'Estado de la Cuenta: En Observación',
      desc: 'Has realizado demasiadas acciones de eliminación. Evita conductas erráticas para mantener tu estatus de confianza.',
      borderColor: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.05)'
    };
  }

  return (
    <>
      {/* ── Identidad en Pista 8 ── */}
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
              onChange={e => {
                const val = e.target.value;
                if (val.length <= 30 && countWords(val) <= 3) {
                  setProfileData({ ...profileData, nickname: val });
                }
              }}
              placeholder="ViajeroEstelar"
              maxLength={30}
            />
          </FormRow>
          <FormRow>
            <FormLabel>Teléfono</FormLabel>
            <PhoneInputWrap>
              <PhonePrefix>+591</PhonePrefix>
              <FormInput
                type="tel"
                value={profileData.phone ? profileData.phone.replace('+591', '') : ''}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="70000000"
                maxLength={8}
              />
            </PhoneInputWrap>
            {phoneErr && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#e53e3e', fontWeight: 600 }}>{phoneErr}</p>}
          </FormRow>
        </FieldGrid>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginTop: '16px' }}>
          <div style={{
            flex: '1 1 250px',
            border: `1px solid ${stateConfig.borderColor}`,
            backgroundColor: stateConfig.bgColor,
            padding: '16px',
            borderRadius: '12px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stateConfig.icon}
              </span>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800, color: '#1a1f22' }}>
                  {stateConfig.title}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', lineHeight: 1.5, fontWeight: 500 }}>
                  {stateConfig.desc}
                </p>
              </div>
            </div>
          </div>

          <SaveBtnWrapper>
            <SaveBtn onClick={onSave} disabled={saving || readOnlyMode} data-tooltip={readOnlyMode ? 'Estás en modo lectura ahora' : 'Guardar Perfil'} data-tooltip-position="top">
              {saving ? 'Guardando...' : readOnlyMode ? 'Estás en modo lectura ahora' : 'Guardar Perfil'}
            </SaveBtn>
          </SaveBtnWrapper>
        </div>
      </Section>

      {/* ── Información Académica — solo para participantes (no admin ni organización) ── */}
      {!isAdmin && !isCompany && !isJudge && (
        <Section>
          <SectionHeader>
            <SectionLabel>Información Académica</SectionLabel>
            <SectionLine />
          </SectionHeader>

          <FieldGrid>
            {/* Área / Facultad */}
            <FieldFull>
              <FormRow>
                <FormLabel>Área de conocimiento</FormLabel>
                <select
                  value={profileData.specialty}
                  onChange={e => setProfileData({ ...profileData, specialty: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(72,80,84,0.1)', outline: 'none',
                    fontSize: 14, fontWeight: 500, color: '#1a1f22',
                    background: '#f8f9fa', cursor: 'pointer',
                  }}
                >
                  <option value="">Selecciona tu área principal</option>
                  {dbFaculties
                    .filter(f => f.name.toLowerCase() !== 'todas')
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {formatFacultyLabel(f.name)}
                      </option>
                    ))}
                </select>
              </FormRow>
            </FieldFull>

            {/* Toggle estudiante */}
            <FieldFull>
              <FormRow>
                <FormLabel>¿Eres estudiante?</FormLabel>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                  <div
                    onClick={() => setProfileData({ ...profileData, isStudent: !profileData.isStudent, studentCode: !profileData.isStudent ? profileData.studentCode : '' })}
                    style={{
                      position: 'relative',
                      width: '44px', height: '24px',
                      borderRadius: '999px',
                      background: profileData.isStudent ? '#e84a0e' : '#d1d5db',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '3px',
                      left: profileData.isStudent ? '23px' : '3px',
                      width: '18px', height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#4b5563' }}>
                    {profileData.isStudent ? 'Sí, soy estudiante' : 'No, no soy estudiante'}
                  </span>
                </label>
              </FormRow>
            </FieldFull>

            {/* Código estudiantil — solo visible si isStudent */}
            {profileData.isStudent && (
              <FieldFull>
                <FormRow>
                  <FormLabel>Código estudiantil *</FormLabel>
                  <FormInput
                    type="text"
                    value={profileData.studentCode}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      if (val.length <= 10) {
                        setProfileData({ ...profileData, studentCode: val });
                      }
                    }}
                    placeholder="Ej: 20220150"
                    maxLength={10}
                  />
                </FormRow>
              </FieldFull>
            )}
          </FieldGrid>
        </Section>
      )}
    </>
  );
};

export default ProfileBasicInfo;