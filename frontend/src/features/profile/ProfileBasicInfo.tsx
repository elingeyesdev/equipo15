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
  TextArea,
  PhoneInputWrap,
  PhonePrefix,
  SaveBtn,
  SaveBtnWrapper,
  ToggleProfessionalBtn,
} from './ProfileStyles';


const INSTITUTIONS = ['Univalle', 'UAGRM', 'UPSA', 'Empresa Particular', 'Independiente', 'Otro'];
const OCCUPATIONS = ['Estudiante', 'Empleado', 'Independiente', 'Desempleado', 'Otro'];
const AGE_RANGES = ['18-25 años', '26-35 años', '36-45 años', 'Más de 46 años'];

export interface BasicInfoData {
  bio: string;
  nickname: string;
  phone: string;
  institucion_educativa: string;
  ocupacion_laboral: string;
  codigo_estudiantil: string;
  specialty: string;
  ageRange: string;
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
  const [showProfessional, setShowProfessional] = useState(
    !!profileData.specialty || !!profileData.ageRange || !!profileData.bio
  );
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
  const isCompany = role === 'company';
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

      {!isAdmin && !isCompany && (
        <>
          <Section>
            <SectionHeader>
              <SectionLabel>Formación Académica (Opcional)</SectionLabel>
              <SectionLine />
            </SectionHeader>
            <p style={{ margin: '-8px 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
              Ayuda a los jueces a conocer tu contexto educativo.
            </p>
            <FieldGrid>
              <FieldFull>
                <FormRow>
                  <FormLabel>Institución / Universidad</FormLabel>
                  <select
                    value={profileData.institucion_educativa}
                    onChange={e => setProfileData({ ...profileData, institucion_educativa: e.target.value })}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 12,
                      border: '1.5px solid rgba(72,80,84,0.1)', outline: 'none',
                      fontSize: 14, fontWeight: 500, color: '#1a1f22',
                      background: '#f8f9fa', cursor: 'pointer',
                    }}
                  >
                    <option value="">¿Dónde te formaste o estudias actualmente?</option>
                    {INSTITUTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </FormRow>
              </FieldFull>
            </FieldGrid>
          </Section>

          <Section>
            <SectionHeader>
              <SectionLabel>Ocupación Laboral</SectionLabel>
              <SectionLine />
            </SectionHeader>
            <p style={{ margin: '-8px 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
              Cuéntanos a qué te dedicas actualmente.
            </p>
            <FieldGrid>
              <FieldFull>
                <FormRow>
                  <FormLabel>Ocupación Laboral</FormLabel>
                  <select
                    value={profileData.ocupacion_laboral}
                    onChange={e => {
                      const nextOcupacion = e.target.value;
                      setProfileData({
                        ...profileData,
                        ocupacion_laboral: nextOcupacion,
                        codigo_estudiantil: nextOcupacion === 'Estudiante' ? profileData.codigo_estudiantil : '',
                      });
                    }}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 12,
                      border: '1.5px solid rgba(72,80,84,0.1)', outline: 'none',
                      fontSize: 14, fontWeight: 500, color: '#1a1f22',
                      background: '#f8f9fa', cursor: 'pointer',
                    }}
                  >
                    <option value="">¿Cuál es tu ocupación actual?</option>
                    {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FormRow>
              </FieldFull>

              {profileData.ocupacion_laboral === 'Estudiante' && !isJudge && (
                <FieldFull>
                  <FormRow>
                    <FormLabel>Código Estudiantil *</FormLabel>
                    <FormInput
                      type="text"
                      value={profileData.codigo_estudiantil}
                      onChange={e => {
                        const val = e.target.value.toUpperCase();
                        if (val.length <= 10) {
                          setProfileData({ ...profileData, codigo_estudiantil: val });
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
        </>
      )}

      {!isAdmin && !isCompany && (
        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          <ToggleProfessionalBtn onClick={() => setShowProfessional(!showProfessional)}>
            <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
              {showProfessional ? '−' : '+'}
            </span>
            {showProfessional ? 'Ocultar Hoja de Vuelo Profesional' : 'Completar Hoja de Vuelo Profesional'}
          </ToggleProfessionalBtn>
        </div>
      )}

      {!isAdmin && !isCompany && showProfessional && (
        <Section>
          <SectionHeader>
            <SectionLabel>Perfil Profesional</SectionLabel>
            <SectionLine />
          </SectionHeader>
          <FieldGrid>
            <FieldFull>
              <FormRow>
                <FormLabel>Especialidad / Carrera</FormLabel>
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
                  <option value="">Selecciona tu área de conocimiento principal.</option>
                  {dbFaculties
                    .filter((f) => f.name.toLowerCase() !== 'todas')
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {formatFacultyLabel(f.name)}
                      </option>
                    ))}
                </select>
              </FormRow>
            </FieldFull>
            <FieldFull>
              <FormRow>
                <FormLabel>Rango de Edad</FormLabel>
                <select
                  value={profileData.ageRange}
                  onChange={e => setProfileData({ ...profileData, ageRange: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(72,80,84,0.1)', outline: 'none',
                    fontSize: 14, fontWeight: 500, color: '#1a1f22',
                    background: '#f8f9fa', cursor: 'pointer',
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#a8b2ba', fontWeight: 600 }}>
                  Este dato ayuda a las empresas a entender el alcance generacional de las propuestas.
                </p>
              </FormRow>
            </FieldFull>
            <FieldFull>
              <FormRow>
                <FormLabel>Bio / Descripción</FormLabel>
                <TextArea
                  value={profileData.bio}
                  onChange={e => {
                    const val = e.target.value;
                    if (val.length <= 200) {
                      setProfileData({ ...profileData, bio: val });
                    }
                  }}
                  placeholder="Escribe brevemente sobre tu experiencia o intereses de innovación (máx. 200 caracteres)."
                  maxLength={200}
                />
                <div style={{ fontSize: '11px', color: '#a8b2ba', textAlign: 'right', fontWeight: 600 }}>
                  {profileData.bio.length} / 200 caracteres
                </div>
              </FormRow>
            </FieldFull>
          </FieldGrid>
        </Section>
      )}

    </>
  );
};

export default ProfileBasicInfo;