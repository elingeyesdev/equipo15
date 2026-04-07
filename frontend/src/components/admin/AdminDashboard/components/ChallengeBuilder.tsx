import React from 'react';
import * as S from '../styles/AdminStyles';
import { Pista8Theme } from '../../../../config/theme';
import { FACULTIES, getFacultySlug } from '../../../../config/faculties';

interface ChallengeBuilderProps {
  userProfile: any;
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
  isFormValid: boolean;
  handleSaveChallenge: (status: 'Borrador' | 'Activo') => Promise<boolean>;
  saving: boolean;
}

const ChallengeBuilder: React.FC<ChallengeBuilderProps> = ({
  userProfile, showForm, setShowForm, isPreview, setIsPreview, formData, setFormData,
  togglePrivacy, handleStartDateChange, copyToClipboard, copyStatus, isFormValid,
  handleSaveChallenge, saving
}) => {
  if (!showForm) {
    return (
      <S.EmptyState>
        <S.EmptyIcon>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </S.EmptyIcon>
        <S.EmptyLabel>No hay retos activos todavía. Iniciá uno para el Sprint 1.</S.EmptyLabel>
        <S.PrimaryBtn onClick={() => setShowForm(true)}>Crear Nuevo Reto</S.PrimaryBtn>
      </S.EmptyState>
    );
  }

  return (
    <S.Builder>
      <S.BuilderNav>
        <S.TabBtn active={!isPreview} onClick={() => setIsPreview(false)}>Editor</S.TabBtn>
        <S.TabBtn active={isPreview} onClick={() => setIsPreview(true)}>Vista Previa</S.TabBtn>
      </S.BuilderNav>

      <S.BuilderBody>
        {isPreview ? (
          <S.PreviewCard>
            <S.PreviewHead>
              <S.PreviewGrid />
              <S.PreviewRoleTag>
                {(userProfile?.displayName || 'USUARIO')?.toUpperCase()} LANZA
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
                <S.PreviewBadge type="date">Expira: {formData.endDate || '--'}</S.PreviewBadge>
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
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FieldLabel>Asignar a Facultad</S.FieldLabel>
                <S.Select 
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: Number(e.target.value)})}
                >
                  <option value="0">Todas las Facultades</option>
                  {FACULTIES.map(f => (
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
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </S.FormGroup>

            <S.TwoColumnRow style={{ marginBottom: '16px' }}>
              <S.FormGroup>
                <S.FieldLabel>Contexto de la Empresa (Opcional)</S.FieldLabel>
                <S.Textarea 
                  placeholder="Cuéntanos un poco sobre tu empresa o el área del reto..."
                  rows={4}
                  value={formData.companyContext}
                  onChange={(e) => setFormData({...formData, companyContext: e.target.value})}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FieldLabel>Reglas de Participación (Opcional)</S.FieldLabel>
                <S.Textarea 
                  placeholder="Ej: Solo estudiantes de 5to semestre, grupos de 3 personas, etc."
                  rows={4}
                  value={formData.participationRules}
                  onChange={(e) => setFormData({...formData, participationRules: e.target.value})}
                />
              </S.FormGroup>
            </S.TwoColumnRow>

            <S.PrivacyToggleRow>
              <div>
                <S.FieldLabel style={{ color: Pista8Theme.secondary }}>Visibilidad del Reto</S.FieldLabel>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a8b0b8' }}>
                  {formData.isPrivate ? 'Solo accesible con invitación.' : 'Visible para todos los estudiantes.'}
                </p>
              </div>
              <input 
                type="checkbox" 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                checked={formData.isPrivate}
                onChange={togglePrivacy}
              />
            </S.PrivacyToggleRow>

            {formData.isPrivate && (
              <S.ShareLinkSection>
                <S.FieldLabel style={{ color: Pista8Theme.primary, marginBottom: '12px' }}>Enlace de Invitación</S.FieldLabel>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <S.Input 
                    readOnly 
                    style={{ flex: 1, fontSize: '13px', background: 'white' }}
                    value={`pista8.com/challenges/private/${formData.token}`}
                  />
                  <S.CopyBtn onClick={copyToClipboard}>
                    {copyStatus ? '¡Copiado!' : 'Copiar'}
                  </S.CopyBtn>
                </div>
              </S.ShareLinkSection>
            )}

            <S.DateRow>
              <S.FormGroup style={{ marginBottom: 0 }}>
                <S.FieldLabel>Fecha de Inicio</S.FieldLabel>
                <S.Input type="date" value={formData.startDate} onChange={handleStartDateChange} />
              </S.FormGroup>
              <S.FormGroup style={{ marginBottom: 0 }}>
                <S.FieldLabel>Fecha de Cierre (mín. +7 días desde inicio)</S.FieldLabel>
                <S.Input 
                  type="date" 
                  value={formData.endDate} 
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </S.FormGroup>
            </S.DateRow>

            <S.FormActions>
              <S.GhostBtn type="button" onClick={() => setShowForm(false)} disabled={saving}>
                Cancelar
              </S.GhostBtn>
              <S.DraftBtn 
                type="button" 
                onClick={() => handleSaveChallenge('Borrador')} 
                disabled={saving || !formData.title}
              >
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </S.DraftBtn>
              <S.PrimaryBtn 
                type="button" 
                onClick={() => handleSaveChallenge('Activo')} 
                disabled={saving || !isFormValid}
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
