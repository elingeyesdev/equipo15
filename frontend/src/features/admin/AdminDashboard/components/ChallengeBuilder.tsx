import React, { useEffect, useState } from 'react';
import * as S from '../styles/AdminStyles';
import { Pista8Theme } from '../../../../config/theme';
import { FACULTIES, getFacultySlug } from '../../../../config/faculties';
import { resolveDisplayName } from '../../../../utils/user.utils';
import { facultiesService, formatFacultyLabel } from '@/services/faculties.service';
import type { FacultyCatalogItem } from '@/types/models';

interface ChallengeBuilderProps {
  userProfile: any;
  readOnlyMode: boolean;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
  isPreview: boolean;
  setIsPreview: (b: boolean) => void;
  formData: any;
  setFormData: (d: any) => void;
  togglePrivacy: () => void;
  handleStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  copyToClipboard: () => void;
  copyStatus: boolean;
  formErrors: Record<string, string | null>;
  submitted: boolean;
  setSubmitted: (b: boolean) => void;
  handleSaveChallenge: (status: 'Borrador' | 'Activo') => Promise<boolean>;
  saving: boolean;
}

const ChallengeBuilder: React.FC<ChallengeBuilderProps> = ({
  userProfile, readOnlyMode, showForm, setShowForm, isPreview, setIsPreview, formData, setFormData,
  togglePrivacy, handleStartDateChange, copyToClipboard, copyStatus, formErrors,
  submitted, setSubmitted, handleSaveChallenge, saving
}) => {
  const [apiFaculties, setApiFaculties] = useState<FacultyCatalogItem[]>([]);

  useEffect(() => {
    void facultiesService.getActiveFaculties().then(setApiFaculties).catch(() => setApiFaculties([]));
  }, []);

  const facultyOptions = apiFaculties.length > 0
    ? apiFaculties.filter((f) => f.name.toLowerCase() !== 'todas')
    : null;

  const today = new Date().toISOString().split('T')[0];
  if (!showForm) {
    return (
      <S.EmptyState>
        <S.EmptyIcon>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </S.EmptyIcon>
        <S.EmptyLabel>
          {readOnlyMode
            ? 'Estás en modo lectura ahora. Las funciones de crear y editar permanecen bloqueadas.'
            : 'No hay retos activos todavía. Iniciá uno para el Sprint 1.'}
        </S.EmptyLabel>
        <S.PrimaryBtn
          onClick={() => setShowForm(true)}
          disabled={readOnlyMode}
          $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Crear Nuevo Reto'}
        >
          Crear Nuevo Reto
        </S.PrimaryBtn>
      </S.EmptyState>
    );
  }

  const modeHint = readOnlyMode
    ? 'Estás en modo lectura ahora: no puedes crear ni editar retos durante esta sesión.'
    : null;

  return (
    <S.Builder>
      <S.BuilderNav>
        <S.TabBtn active={!isPreview} onClick={() => setIsPreview(false)} disabled={readOnlyMode} $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Editor'}>
          Editor
        </S.TabBtn>
        <S.TabBtn active={isPreview} onClick={() => setIsPreview(true)} disabled={readOnlyMode} $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Vista Previa'}>
          Vista Previa
        </S.TabBtn>
      </S.BuilderNav>

      <S.BuilderBody>
        {modeHint && (
          <S.EmptyState style={{ minHeight: 'unset', padding: '18px 20px', marginBottom: '20px', alignItems: 'flex-start', width: '100%' }}>
            <S.EmptyLabel style={{ textAlign: 'left' }}>{modeHint}</S.EmptyLabel>
          </S.EmptyState>
        )}

        {isPreview ? (
          <S.PreviewCard>
            <S.PreviewHead>
              <S.PreviewGrid />
              <S.PreviewRoleTag>
                {(resolveDisplayName(userProfile) || 'USUARIO')?.toUpperCase()} LANZA
              </S.PreviewRoleTag>
              <S.PreviewTitle>{formData.title || 'Título del Reto'}</S.PreviewTitle>
            </S.PreviewHead>
            <S.PreviewBody>
              <S.PreviewDescription>
                {formData.description || 'Sin descripción todavía...'}
              </S.PreviewDescription>

              <S.TwoColumnRow style={{ marginTop: '20px', gap: '24px', opacity: 0.9 }}>
                {formData.companyContext && (
                  <div>
                    <S.FieldLabel style={{ fontSize: '10px', marginBottom: '6px' }}>CONTEXTO</S.FieldLabel>
                    <p style={{ fontSize: '12.5px', color: '#4a5568', lineHeight: '1.5', margin: 0 }}>{formData.companyContext}</p>
                  </div>
                )}

                {formData.participationRules && (
                  <div>
                    <S.FieldLabel style={{ fontSize: '10px', marginBottom: '6px' }}>REGLAS</S.FieldLabel>
                    <p style={{ fontSize: '12.5px', color: '#4a5568', lineHeight: '1.5', margin: 0 }}>{formData.participationRules}</p>
                  </div>
                )}
              </S.TwoColumnRow>
              <S.PreviewFooter>
                <S.PreviewBadge type="privacy">{getFacultySlug(formData.facultyId)}</S.PreviewBadge>
                <S.PreviewBadge type="privacy">{formData.isPrivate ? 'Privado' : 'Público'}</S.PreviewBadge>
                <S.PreviewBadge type="date">Expira: {formData.submissionsCloseAt || formData.endDate || '--'}</S.PreviewBadge>
              </S.PreviewFooter>
            </S.PreviewBody>
          </S.PreviewCard>
        ) : (
          <>
            <S.TwoColumnRow>
              <S.FormGroup>
                <S.FieldLabel>Título del Desafío</S.FieldLabel>
                <S.Input 
                  placeholder="Ej: Rediseñar el sistema de becas..."
                  value={formData.title}
                    disabled={readOnlyMode}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                {submitted && formErrors.title && <S.ErrorText>{formErrors.title}</S.ErrorText>}
              </S.FormGroup>

              <S.FormGroup>
                <S.FieldLabel>Asignar a Facultad</S.FieldLabel>
                <S.Select 
                  value={formData.facultyId ?? 0}
                    disabled={readOnlyMode}
                  onChange={(e) => {
                    const next = e.target.value;
                    setFormData({
                      ...formData,
                      facultyId: next === '0' ? 0 : next,
                    });
                  }}
                >
                  <option value="0">Todas las Facultades</option>
                  {facultyOptions
                    ? facultyOptions.map((f) => (
                        <option key={f.id} value={f.id}>{formatFacultyLabel(f.name)}</option>
                      ))
                    : FACULTIES.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                </S.Select>
              </S.FormGroup>
            </S.TwoColumnRow>

            <S.FormGroup>
              <S.FieldLabel>Planteamiento del Problema</S.FieldLabel>
              <S.Textarea 
                placeholder="Describe el problema que los participantes deben resolver..."
                rows={4}
                value={formData.description}
                  disabled={readOnlyMode}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              {submitted && formErrors.description && <S.ErrorText>{formErrors.description}</S.ErrorText>}
            </S.FormGroup>

            <S.TwoColumnRow style={{ marginBottom: '16px' }}>
              <S.FormGroup>
                <S.FieldLabel>Contexto de la Empresa</S.FieldLabel>
                <S.Textarea 
                  placeholder="Cuéntanos un poco sobre tu empresa o el área del reto..."
                  rows={4}
                  value={formData.companyContext}
                  disabled={readOnlyMode}
                  onChange={(e) => setFormData({...formData, companyContext: e.target.value})}
                />
                {submitted && formErrors.companyContext && <S.ErrorText>{formErrors.companyContext}</S.ErrorText>}
              </S.FormGroup>

              <S.FormGroup>
                <S.FieldLabel>Reglas de Participación</S.FieldLabel>
                <S.Textarea 
                  placeholder="Ej: Solo estudiantes de 5to semestre, grupos de 3 personas, etc."
                  rows={4}
                  value={formData.participationRules}
                  disabled={readOnlyMode}
                  onChange={(e) => setFormData({...formData, participationRules: e.target.value})}
                />
                {submitted && formErrors.participationRules && <S.ErrorText>{formErrors.participationRules}</S.ErrorText>}
              </S.FormGroup>
            </S.TwoColumnRow>

            <S.PrivacyToggleRow>
              <div>
                <S.FieldLabel style={{ color: Pista8Theme.secondary }}>Visibilidad del Reto</S.FieldLabel>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a8b0b8' }}>
                  {readOnlyMode
                    ? 'Bloqueado en modo lectura.'
                    : formData.isPrivate
                      ? 'Solo accesible con invitación.'
                      : 'Visible para todos los estudiantes.'}
                </p>
              </div>
              <input 
                type="checkbox" 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                checked={formData.isPrivate}
                disabled={readOnlyMode}
                onChange={togglePrivacy}
              />
            </S.PrivacyToggleRow>

            {formData.isPrivate && (
              <S.ShareLinkSection>
                <S.FieldLabel style={{ color: Pista8Theme.primary, marginBottom: '12px' }}>Enlace de Invitación</S.FieldLabel>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <S.Input 
                    readOnly 
                    value={`${window.location.origin}/dashboard/reto/${formData.token}`}
                    disabled={readOnlyMode}
                  />
                  <S.CopyBtn onClick={copyToClipboard} disabled={readOnlyMode} $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Copiar'}>
                    {copyStatus ? '¡Copiado!' : 'Copiar'}
                  </S.CopyBtn>
                </div>
              </S.ShareLinkSection>
            )}

            <S.DateRow>
              <S.FormGroup style={{ marginBottom: 0 }}>
                <S.FieldLabel>Fecha de Inicio del Reto</S.FieldLabel>
                <S.Input type="date" value={formData.startDate} min={today} disabled={readOnlyMode} onChange={handleStartDateChange} />
                {submitted && formErrors.startDate && <S.ErrorText>{formErrors.startDate}</S.ErrorText>}
              </S.FormGroup>
              <S.FormGroup style={{ marginBottom: 0 }}>
                <S.FieldLabel>Fecha de Cierre</S.FieldLabel>
                <S.Input 
                  type="date" 
                  value={formData.endDate} 
                  disabled={readOnlyMode}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
                {submitted && formErrors.dates && <S.ErrorText>{formErrors.dates}</S.ErrorText>}
              </S.FormGroup>
            </S.DateRow>

            <S.FormActions>
              <S.GhostBtn type="button" onClick={() => { setSubmitted(false); setShowForm(false); }} disabled={saving || readOnlyMode} $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Cancelar'}>
                Cancelar
              </S.GhostBtn>
              <S.DraftBtn 
                type="button" 
                onClick={() => handleSaveChallenge('Borrador')} 
                disabled={saving || readOnlyMode || !formData.title}
                $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Guardar Borrador'}
              >
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </S.DraftBtn>
              <S.PrimaryBtn 
                type="button" 
                onClick={() => handleSaveChallenge('Activo')} 
                disabled={saving || readOnlyMode}
                $tooltipText={readOnlyMode ? 'Estás en modo lectura ahora' : 'Publicar Reto'}
              >
                {saving ? 'Publicando...' : 'Publicar Reto'}
              </S.PrimaryBtn>
            </S.FormActions>
          </>
        )}
      </S.BuilderBody>
    </S.Builder>
  );
};

export default ChallengeBuilder;
