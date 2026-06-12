import React from 'react';
import { Pista8Theme } from '../../../../config/theme';
import { FACULTIES, getFacultyName } from '../../../../config/faculties';
import type { ChallengeStatus } from '../../../../types/models';
import type { ChallengeFormData, Errors } from './useChallengeForm';
import { LIMITS, formatDate } from './useChallengeForm';
import BackButton from '../../../../components/common/BackButton';
import InfoTooltip from '../../../../components/common/InfoTooltip';
import {
  Wrapper, TopRow, FormTitle, FormCard, PreviewCard,
  PreviewLabel, PreviewTitle, PreviewSection, PreviewSectionLabel,
  PreviewText, PreviewLogoWrap, PreviewDateRow, PreviewCriteriaList,
  PreviewCriteriaChip, PreviewWeightBadge, PreviewTypeBadge, Divider,
  SectionTitle, FormGrid, FullSpan, FieldGroup, Label, LockedBadge,
  InputField, TextAreaField, CharCount, ErrorText, CheckboxRow,
  LogoUploadArea, LogoThumb, LogoPlaceholder, UploadText,
  CriteriaToggleBtn, CriteriaPanel, CriterionRow, CriterionCheckbox,
  CriterionName, WeightInput, WeightUnit, AddCriterionBtn,
  CustomCriterionInput, RemoveBtn, TotalWeightBar, BtnRow, Btn, ConfirmBanner, OptionalToggleBtn,
} from './challengeFormStyles';

const LightboxOverlay: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => (
  <div onClick={onClose} style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, cursor: 'zoom-out', animation: 'fadeIn 0.2s ease',
  }}>
    <img src={src} alt="logo preview" onClick={e => e.stopPropagation()} style={{
      maxWidth: '80vw', maxHeight: '80vh', borderRadius: 20,
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)', objectFit: 'contain',
    }} />
    <button onClick={onClose} style={{
      position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.15)',
      border: 'none', color: 'white', width: 40, height: 40,
      borderRadius: '50%', fontSize: 20, cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>✕</button>
  </div>
);

export interface ChallengeFormFieldsProps {
  form: ChallengeFormData;
  errors: Errors;
  saving: boolean;
  readOnlyMode: boolean;
  showConfirm: boolean;
  setShowConfirm: (v: boolean) => void;
  criteriaOpen: boolean;
  addingCustom: boolean;
  setAddingCustom: (v: boolean) => void;
  customName: string;
  setCustomName: (v: string) => void;
  customError: string;
  setCustomError: (v: string) => void;
  lightboxOpen: boolean;
  setLightboxOpen: (v: boolean) => void;
  logoError: string;
  dbFaculties: any[];
  criteriaRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isEditMode: boolean;
  hasIdeas: boolean;
  today: string;
  totalWeight: number;
  locked: (field: 'core' | 'flexible') => boolean;
  updateField: <K extends keyof ChallengeFormData>(key: K, val: ChallengeFormData[K]) => void;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateCriterion: (id: string, patch: Partial<import('../../../../types/models').EvaluationCriterion>) => void;
  removeCriterion: (id: string) => void;
  addCustomCriterion: () => void;
  handleBack: () => void;
  handleSave: (status: ChallengeStatus) => Promise<void>;
  toggleCriteria: () => void;
  onBack: () => void;
}

export const ChallengeFormFields: React.FC<ChallengeFormFieldsProps> = ({
  form,
  errors,
  saving,
  showConfirm,
  setShowConfirm,
  criteriaOpen,
  addingCustom,
  setAddingCustom,
  customName,
  setCustomName,
  customError,
  setCustomError,
  lightboxOpen,
  setLightboxOpen,
  logoError,
  dbFaculties,
  criteriaRef,
  fileInputRef,
  isEditMode,
  hasIdeas,
  today,
  totalWeight,
  locked,
  updateField,
  handleLogoChange,
  updateCriterion,
  removeCriterion,
  addCustomCriterion,
  handleBack,
  handleSave,
  toggleCriteria,
  onBack,
  readOnlyMode,
}) => {
  const [showOptionals, setShowOptionals] = React.useState(false);

  return (
  <>
    {readOnlyMode && (
      <ConfirmBanner style={{ marginBottom: 20, borderColor: '#f59e0b', background: 'linear-gradient(180deg, rgba(245,158,11,0.12), rgba(254,65,10,0.06))' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
          Estás en modo lectura ahora. No puedes crear ni editar retos durante esta sesión.
        </span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#a16207', fontSize: 12, fontWeight: 800 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#f59e0b', display: 'inline-block' }} />
          Solo lectura
        </div>
      </ConfirmBanner>
    )}

    {lightboxOpen && form.logoUrl && (
      <LightboxOverlay src={form.logoUrl} onClose={() => setLightboxOpen(false)} />
    )}
    <TopRow>
      <BackButton onClick={handleBack} />
      <FormTitle>{isEditMode ? 'Editar Reto' : 'Crear Nuevo Reto'}</FormTitle>
    </TopRow>

    {showConfirm && (
      <ConfirmBanner>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
          Tienes cambios sin guardar. Si sales ahora perderás la información.
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={() => setShowConfirm(false)}>Seguir editando</Btn>
          <Btn $primary onClick={() => { setShowConfirm(false); onBack(); }}>Salir sin guardar</Btn>
        </div>
      </ConfirmBanner>
    )}

    {hasIdeas && isEditMode && (
      <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 14,
        padding: '12px 20px', marginBottom: 20, fontSize: 13, fontWeight: 600, color: '#92400e' }}>
        Este reto ya tiene ideas postuladas. Título, descripción, contexto y criterios están bloqueados.
      </div>
    )}

    <Wrapper>
      <FormCard>
        <SectionTitle>Información del Reto</SectionTitle>
        <FormGrid>

          <FullSpan>
            <FieldGroup>
              <Label>Logo del reto</Label>
              <LogoUploadArea $hasImage={!!form.logoUrl} onClick={() => !readOnlyMode && fileInputRef.current?.click()} style={{ cursor: readOnlyMode ? 'not-allowed' : 'pointer', opacity: readOnlyMode ? 0.92 : 1 }}>
                {form.logoUrl
                  ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <LogoThumb
                          src={form.logoUrl}
                          alt="logo"
                          style={{ width: 72, height: 72, borderRadius: 16, cursor: 'zoom-in' }}
                          onClick={e => { e.stopPropagation(); setLightboxOpen(true); }}
                          title="Clic para ver en grande"
                        />
                        <div style={{
                          position: 'absolute', bottom: 4, right: 4,
                          background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '2px 4px',
                          fontSize: 9, color: 'white', fontWeight: 700, pointerEvents: 'none',
                        }}>🔍</div>
                      </div>
                      <UploadText>
                        <p>Cambiar logo</p>
                        <span>JPG, PNG o WEBP · Se convierte automáticamente a WebP</span>
                        <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: Pista8Theme.primary }}>Haz clic en la imagen para verla en grande</span>
                      </UploadText>
                    </div>
                  )
                  : (
                    <>
                      <LogoPlaceholder>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c0c8d0" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </LogoPlaceholder>
                      <UploadText>
                        <p>Subir logo del reto</p>
                        <span>JPG, PNG o WEBP · Se convierte automáticamente a WebP</span>
                      </UploadText>
                    </>
                  )
                }
                {form.logoUrl && !readOnlyMode && (
                  <Btn style={{ padding: '8px 14px', fontSize: 12, flexShrink: 0 }}
                    onClick={e => { e.stopPropagation(); updateField('logoUrl', ''); }}>
                    Quitar
                  </Btn>
                )}
              </LogoUploadArea>
              <input ref={fileInputRef as React.Ref<HTMLInputElement>} type="file" accept=".jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }} onChange={handleLogoChange} />
              {logoError && <ErrorText style={{ marginTop: 4 }}>{logoError}</ErrorText>}
            </FieldGroup>
          </FullSpan>

          <FullSpan>
            <FieldGroup>
              <Label $locked={locked('core')}>
                Título del reto *
                {locked('core') && <LockedBadge>No editable</LockedBadge>}
              </Label>
              <InputField $locked={locked('core')} $error={!!errors.title}
                placeholder="Ej: Optimización de procesos logísticos"
                value={form.title} readOnly={locked('core')}
                onChange={e => !locked('core') && updateField('title', e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {errors.title ? <ErrorText>{errors.title}</ErrorText> : <span />}
                <CharCount $over={form.title.length > LIMITS.title}>
                  {form.title.length}/{LIMITS.title}
                </CharCount>
              </div>
            </FieldGroup>
          </FullSpan>

          <FieldGroup>
            <Label $locked={locked('core')}>
              Descripción del problema
              {locked('core') && <LockedBadge>No editable</LockedBadge>}
            </Label>
            <TextAreaField $locked={locked('core')} $error={!!errors.problemDescription}
              placeholder="Describe el problema que quieres resolver..."
              value={form.problemDescription} readOnly={locked('core')} rows={2}
              onChange={e => !locked('core') && updateField('problemDescription', e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.problemDescription ? <ErrorText>{errors.problemDescription}</ErrorText> : <span />}
              <CharCount $over={form.problemDescription.length > LIMITS.problemDescription}>
                {form.problemDescription.length}/{LIMITS.problemDescription}
              </CharCount>
            </div>
          </FieldGroup>

          <FieldGroup>
            <Label $locked={locked('core')}>
              Contexto de la empresa
              {locked('core') && <LockedBadge>No editable</LockedBadge>}
            </Label>
            <TextAreaField $locked={locked('core')} $error={!!errors.companyContext}
              placeholder="Información relevante sobre tu empresa..." rows={2}
              value={form.companyContext} readOnly={locked('core')}
              onChange={e => !locked('core') && updateField('companyContext', e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.companyContext ? <ErrorText>{errors.companyContext}</ErrorText> : <span />}
              <CharCount $over={form.companyContext.length > LIMITS.companyContext}>
                {form.companyContext.length}/{LIMITS.companyContext}
              </CharCount>
            </div>
          </FieldGroup>

          <FieldGroup style={{ display: 'flex', flexDirection: 'column' }}>
            <Label $locked={readOnlyMode}>Reglas de participación{readOnlyMode && <LockedBadge>No editable</LockedBadge>}</Label>
            <TextAreaField placeholder="Reglas o restricciones para las ideas..."
              value={form.participationRules}
              style={{ flex: 1, resize: 'none' }}
              readOnly={readOnlyMode}
              $error={!!errors.participationRules}
              $locked={readOnlyMode}
              onChange={e => !readOnlyMode && updateField('participationRules', e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.participationRules ? <ErrorText>{errors.participationRules}</ErrorText> : <span />}
              <CharCount $over={form.participationRules.length > LIMITS.participationRules}>
                {form.participationRules.length}/{LIMITS.participationRules}
              </CharCount>
            </div>
          </FieldGroup>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FieldGroup style={{ marginBottom: 0 }}>
              <Label $locked={locked('core')}>
                Facultad dirigida
                {locked('core') && <LockedBadge>No editable</LockedBadge>}
              </Label>
              <select
                value={form.facultyId || ''}
                onChange={e => !locked('core') && updateField('facultyId', e.target.value || null)}
                disabled={locked('core')}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid rgba(72,80,84,0.18)', outline: 'none',
                  fontSize: 13.5, fontWeight: 500, color: '#1a1f22',
                  backgroundColor: locked('core') ? '#f8f9fa' : 'white',
                  cursor: locked('core') ? 'not-allowed' : 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23485054%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                }}
              >
                <option value="">Todas las Facultades</option>
                {dbFaculties.length > 0 ? (
                  dbFaculties.filter((f: any) => f.name !== 'Todas').map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name.startsWith('Facultad') ? f.name : `Facultad de ${f.name}`}
                    </option>
                  ))
                ) : (
                  FACULTIES.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))
                )}
              </select>
            </FieldGroup>

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <FieldGroup style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
                <Label $locked={locked('core')}>Fecha inicio *</Label>
                <InputField type="datetime-local" min={today} $locked={locked('core')} $error={!!errors.startDate}
                  value={form.startDate} readOnly={locked('core')}
                  style={{ minWidth: 0, padding: '14px 10px', fontSize: 13 }}
                  onChange={e => !locked('core') && updateField('startDate', e.target.value)} />
                {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
              </FieldGroup>
              <FieldGroup style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>
                <Label $locked={readOnlyMode}>Fecha cierre *{readOnlyMode && <LockedBadge>No editable</LockedBadge>}</Label>
                <InputField type="datetime-local" min={form.startDate || today} $error={!!errors.endDate}
                  value={form.endDate}
                  readOnly={readOnlyMode}
                  $locked={readOnlyMode}
                  style={{ minWidth: 0, padding: '14px 10px', fontSize: 13 }}
                  onChange={e => !readOnlyMode && updateField('endDate', e.target.value)} />
                {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
              </FieldGroup>
            </div>

              <CheckboxRow $locked={readOnlyMode} style={{ marginTop: 2, padding: '14px', border: '1.5px solid rgba(72,80,84,0.18)', borderRadius: 12 }}>
              <input type="checkbox" checked={form.isPrivate}
                disabled={readOnlyMode}
                onChange={e => !readOnlyMode && updateField('isPrivate', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: Pista8Theme.primary }} />
              Reto privado
            </CheckboxRow>

            <FieldGroup style={{ marginBottom: 0 }}>
              <Label>Audiencia objetivo</Label>
              <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8b0b8', margin: '0 0 6px' }}>Rango de edad</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['18-22', '23-27', '28-35', '36+'].map(range => {
                      const sel = form.targetAudience.ageRanges.includes(range);
                      return (
                        <button key={range} type="button" onClick={() => {
                          const next = sel
                            ? form.targetAudience.ageRanges.filter(r => r !== range)
                            : [...form.targetAudience.ageRanges, range];
                          updateField('targetAudience', { ...form.targetAudience, ageRanges: next });
                        }} style={{
                          padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${sel ? Pista8Theme.primary : 'rgba(72,80,84,0.15)'}`,
                          background: sel ? Pista8Theme.primary : 'white', color: sel ? 'white' : '#485054',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                        }}>{range} años</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8b0b8', margin: '0 0 6px' }}>Tipo de participante</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['Universidades', 'Empresas'].map(pType => {
                      const sel = form.targetAudience.participantTypes.includes(pType);
                      return (
                        <button key={pType} type="button" onClick={() => {
                          const next = sel
                            ? form.targetAudience.participantTypes.filter(t => t !== pType)
                            : [...form.targetAudience.participantTypes, pType];
                          updateField('targetAudience', { ...form.targetAudience, participantTypes: next });
                        }} style={{
                          padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${sel ? Pista8Theme.primary : 'rgba(72,80,84,0.15)'}`,
                          background: sel ? Pista8Theme.primary : 'white', color: sel ? 'white' : '#485054',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                        }}>{pType}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </FieldGroup>
          </div>
        </FormGrid>

        <Divider style={{ margin: '28px 0' }} />

        <div ref={criteriaRef}>
          <CriteriaToggleBtn $open={criteriaOpen} onClick={() => !readOnlyMode && toggleCriteria()} type="button" disabled={readOnlyMode} style={{ cursor: readOnlyMode ? 'not-allowed' : 'pointer', opacity: readOnlyMode ? 0.85 : 1 }}>
            <span>Criterios de Evaluación</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </CriteriaToggleBtn>

          {criteriaOpen && (
            <CriteriaPanel style={{ marginTop: 12 }}>
              {locked('core') && (
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  Criterios bloqueados porque ya hay ideas postuladas.
                </p>
              )}

              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8b0b8', margin: '0 0 6px' }}>Obligatorios</p>
              {form.evaluationCriteria.filter(c => !c.isOptional && !c.isCustom).map(c => (
                <CriterionRow key={c.id}>
                  <CriterionCheckbox type="checkbox" checked={c.enabled}
                    disabled={locked('core')}
                    onChange={e => updateCriterion(c.id, { enabled: e.target.checked })} />
                  <CriterionName $enabled={c.enabled} $locked={locked('core')}>{c.name}</CriterionName>
                  {c.description && (
                    <span style={{ marginLeft: 2, display: 'inline-flex', alignItems: 'center' }}>
                      <InfoTooltip text={c.description} size={16} />
                    </span>
                  )}
                  <WeightInput type="number" min={0} max={100}
                    value={c.weight === 0 ? '' : c.weight}
                    disabled={!c.enabled || locked('core')} placeholder="0"
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '') { updateCriterion(c.id, { weight: 0 }); return; }
                      const v = parseInt(raw, 10);
                      if (!isNaN(v)) updateCriterion(c.id, { weight: Math.min(100, v) });
                    }} />
                  <WeightUnit>%</WeightUnit>
                </CriterionRow>
              ))}

              {form.evaluationCriteria.filter(c => c.isOptional).length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <OptionalToggleBtn type="button" $open={showOptionals} onClick={() => setShowOptionals(!showOptionals)}>
                    Opcional
                    <span className="icon-circle">
                      {showOptionals ? '−' : '+'}
                    </span>
                  </OptionalToggleBtn>
                  {showOptionals && form.evaluationCriteria.filter(c => c.isOptional).map(c => (
                    <CriterionRow key={c.id}>
                      <CriterionCheckbox type="checkbox" checked={c.enabled}
                        disabled={locked('core')}
                        onChange={e => updateCriterion(c.id, { enabled: e.target.checked })} />
                      <CriterionName $enabled={c.enabled} $locked={locked('core')}>{c.name}</CriterionName>
                      {c.description && (
                        <span style={{ marginLeft: 2, display: 'inline-flex', alignItems: 'center' }}>
                          <InfoTooltip text={c.description} size={16} />
                        </span>
                      )}
                      <WeightInput type="number" min={0} max={100}
                        value={c.weight === 0 ? '' : c.weight}
                        disabled={!c.enabled || locked('core')} placeholder="0"
                        onChange={e => {
                          const raw = e.target.value;
                          if (raw === '') { updateCriterion(c.id, { weight: 0 }); return; }
                          const v = parseInt(raw, 10);
                          if (!isNaN(v)) updateCriterion(c.id, { weight: Math.min(100, v) });
                        }} />
                      <WeightUnit>%</WeightUnit>
                    </CriterionRow>
                  ))}
                </div>
              )}

              {form.evaluationCriteria.filter(c => c.isCustom).map(c => (
                <CriterionRow key={c.id}>
                  <CriterionCheckbox type="checkbox" checked={c.enabled}
                    disabled={locked('core')}
                    onChange={e => updateCriterion(c.id, { enabled: e.target.checked })} />
                  <CriterionName $enabled={c.enabled} $locked={locked('core')}>{c.name}</CriterionName>
                  <WeightInput type="number" min={0} max={100}
                    value={c.weight === 0 ? '' : c.weight}
                    disabled={!c.enabled || locked('core')} placeholder="0"
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '') { updateCriterion(c.id, { weight: 0 }); return; }
                      const v = parseInt(raw, 10);
                      if (!isNaN(v)) updateCriterion(c.id, { weight: Math.min(100, v) });
                    }} />
                  <WeightUnit>%</WeightUnit>
                  {!locked('core') && (
                    <RemoveBtn type="button" onClick={() => removeCriterion(c.id)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </RemoveBtn>
                  )}
                </CriterionRow>
              ))}

              {form.evaluationCriteria.some(c => c.enabled) && (
                <TotalWeightBar $total={totalWeight}>
                  <span style={{ fontSize: 12, fontWeight: 700, flex: 1, color: '#485054' }}>Total asignado</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: totalWeight > 100 ? '#ef4444' : totalWeight === 100 ? '#22c55e' : '#485054' }}>{totalWeight}%</span>
                  {totalWeight > 100 && <ErrorText>Supera el 100%</ErrorText>}
                  {totalWeight === 100 && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>✓ Perfecto</span>}
                </TotalWeightBar>
              )}

              {!locked('core') && !readOnlyMode && (
                addingCustom ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <CustomCriterionInput autoFocus placeholder="Nombre del criterio (máx. 10 palabras)"
                      value={customName}
                      onChange={e => { setCustomName(e.target.value); setCustomError(''); }}
                      onKeyDown={e => e.key === 'Enter' && addCustomCriterion()} />
                    <Btn $primary style={{ padding: '10px 16px', fontSize: 12 }} onClick={addCustomCriterion} disabled={readOnlyMode}>Añadir</Btn>
                    <Btn style={{ padding: '10px 14px', fontSize: 12 }} onClick={() => { setAddingCustom(false); setCustomName(''); setCustomError(''); }} disabled={readOnlyMode}>
                      Cancelar
                    </Btn>
                    {customError && <ErrorText>{customError}</ErrorText>}
                  </div>
                ) : (
                  <AddCriterionBtn type="button" onClick={() => setAddingCustom(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Añadir Criterio Personalizado
                  </AddCriterionBtn>
                )
              )}
            </CriteriaPanel>
          )}
        </div>

        <BtnRow>
          <Btn type="button" onClick={handleBack} disabled={readOnlyMode}>Cancelar</Btn>
          {!isEditMode && (
            <Btn $outline disabled={saving || readOnlyMode} onClick={() => handleSave('Borrador')}>
              Guardar borrador
            </Btn>
          )}
          <Btn $primary disabled={saving || readOnlyMode} onClick={() => handleSave('Activo')}>
            {saving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Publicar reto'}
          </Btn>
        </BtnRow>
      </FormCard>

      <PreviewCard>
        <PreviewLabel>Vista previa en vivo</PreviewLabel>

        {form.logoUrl && (
          <PreviewLogoWrap>
            <img src={form.logoUrl} alt="logo" />
          </PreviewLogoWrap>
        )}

        <PreviewTitle>{form.title || 'Título del reto...'}</PreviewTitle>

        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: Pista8Theme.primary, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, marginTop: -4, wordBreak: 'break-word' }}>
          {(() => {
            if (!form.facultyId) return 'Todas las Facultades';
            
            const dbFac = dbFaculties?.find((f: any) => f.id === form.facultyId);
            if (dbFac) {
              return dbFac.name.startsWith('Facultad') ? dbFac.name : `Facultad de ${dbFac.name}`;
            }

            return getFacultyName(form.facultyId) || 'Facultad';
          })()}
        </div>

        {(form.startDate || form.endDate) && (
          <PreviewDateRow>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(form.startDate)} — {formatDate(form.endDate)}
          </PreviewDateRow>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <PreviewTypeBadge $isPrivate={form.isPrivate}>
            {form.isPrivate ? 'Reto privado' : 'Reto público'}
          </PreviewTypeBadge>
        </div>

        {(form.targetAudience.ageRanges.length > 0 || form.targetAudience.participantTypes.length > 0) && (
          <PreviewSection>
            <PreviewSectionLabel>Audiencia objetivo</PreviewSectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {form.targetAudience.ageRanges.map(r => (
                <span key={r} style={{ fontSize: 10, fontWeight: 700, background: `${Pista8Theme.primary}15`, color: Pista8Theme.primary, padding: '3px 10px', borderRadius: 6 }}>{r} años</span>
              ))}
              {form.targetAudience.participantTypes.map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 700, background: `${Pista8Theme.primary}15`, color: Pista8Theme.primary, padding: '3px 10px', borderRadius: 6 }}>{t}</span>
              ))}
            </div>
          </PreviewSection>
        )}

        {form.problemDescription && (
          <PreviewSection>
            <PreviewSectionLabel>Descripción del problema</PreviewSectionLabel>
            <PreviewText>{form.problemDescription}</PreviewText>
          </PreviewSection>
        )}

        {form.companyContext && (
          <PreviewSection>
            <PreviewSectionLabel>Contexto de la empresa</PreviewSectionLabel>
            <PreviewText>{form.companyContext}</PreviewText>
          </PreviewSection>
        )}

        {form.participationRules && (
          <PreviewSection>
            <PreviewSectionLabel>Reglas de participación</PreviewSectionLabel>
            <PreviewText>{form.participationRules}</PreviewText>
          </PreviewSection>
        )}

        {form.evaluationCriteria.some(c => c.enabled) && (
          <PreviewSection>
            <PreviewSectionLabel>Criterios de evaluación</PreviewSectionLabel>
            <PreviewCriteriaList>
              {form.evaluationCriteria.filter(c => c.enabled).map(c => (
                <PreviewCriteriaChip key={c.id}>
                  <span>{c.name}</span>
                  <PreviewWeightBadge>{c.weight}%</PreviewWeightBadge>
                </PreviewCriteriaChip>
              ))}
            </PreviewCriteriaList>
          </PreviewSection>
        )}

        {!form.title && !form.problemDescription && !form.companyContext && (
          <p style={{ fontSize: 13, color: '#c0c8d0', textAlign: 'center', marginTop: 32 }}>
            Completa el formulario para ver la vista previa
          </p>
        )}
      </PreviewCard>
    </Wrapper>
  </>
  );
};
