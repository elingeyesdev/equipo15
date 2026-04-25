import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';
import type { Challenge, ChallengeStatus } from '../../../../types/models';

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const Container = styled.div`
  animation: ${fadeIn} 0.3s ease both;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 14px;
  border: 2px solid rgba(72,80,84,0.08);
  background: white;
  color: ${Pista8Theme.secondary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { 
    border-color: rgba(254,65,10,0.3); 
    color: ${Pista8Theme.primary}; 
    transform: translateX(-4px);
  }
`;

const FormTitle = styled.h2`
  font-size: 26px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 12px 40px rgba(72,80,84,0.06);
  border: 1px solid rgba(72,80,84,0.08);
  margin-bottom: 40px;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px 48px;
  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 32px; }
`;

const FullSpan = styled.div`
  grid-column: 1 / -1;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${Pista8Theme.secondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InputField = styled.input<{ $error?: boolean }>`
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid ${p => p.$error ? Pista8Theme.error : '#f1f3f5'};
  font-size: 15px;
  font-weight: 500;
  color: #1a1f22;
  background: #f9fafb;
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: ${p => p.$error ? Pista8Theme.error : Pista8Theme.primary};
    background: white;
    box-shadow: 0 6px 20px rgba(254,65,10,0.08);
  }
  &::placeholder { color: #9ca3af; font-weight: 400; }
`;

const TextAreaField = styled.textarea<{ $error?: boolean }>`
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid ${p => p.$error ? Pista8Theme.error : '#f1f3f5'};
  font-size: 15px;
  font-weight: 500;
  color: #1a1f22;
  background: #f9fafb;
  outline: none;
  resize: none;
  overflow: hidden;
  min-height: 56px;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.2s;
  &:focus {
    border-color: ${p => p.$error ? Pista8Theme.error : Pista8Theme.primary};
    background: white;
    box-shadow: 0 6px 20px rgba(254,65,10,0.08);
  }
  &::placeholder { color: #9ca3af; font-weight: 400; }
`;

const CharCount = styled.span<{ $over: boolean }>`
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  color: ${p => p.$over ? Pista8Theme.error : '#9ca3af'};
  margin-top: 4px;
`;

const ErrorText = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: ${Pista8Theme.error};
  margin: 4px 0 0 0;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  padding: 18px 24px;
  border-radius: 16px;
  background: #f9fafb;
  border: 2px solid #f1f3f5;
  transition: all 0.2s;
  &:hover { border-color: rgba(254,65,10,0.25); background: white; }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 2px solid rgba(72,80,84,0.04);
  margin-top: 10px;
`;

const Btn = styled.button<{ $primary?: boolean }>`
  padding: 14px 36px;
  border-radius: 14px;
  border: none;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$primary ? Pista8Theme.primary : '#f1f3f5'};
  color: ${p => p.$primary ? 'white' : '#6b7280'};
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.$primary ? '0 8px 24px rgba(254,65,10,0.35)' : '0 4px 12px rgba(0,0,0,0.06)'};
    background: ${p => p.$primary ? '#ff4f19' : '#e5e7eb'};
  }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
`;

/* ─── Unsaved Changes Confirm ─── */
const ConfirmBanner = styled.div`
  background: #fef3c7;
  border: 1.5px solid #f59e0b;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

const ConfirmText = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
`;

/* ─── Types ─── */
interface FormData {
  title: string;
  problemDescription: string;
  companyContext: string;
  participationRules: string;
  startDate: string;
  endDate: string;
  isPrivate: boolean;
  status: ChallengeStatus;
}

interface Errors {
  title?: string;
  problemDescription?: string;
  startDate?: string;
  endDate?: string;
}

const LIMITS = {
  title: 80,
  problemDescription: 500,
  companyContext: 500,
  participationRules: 500,
};

const emptyForm: FormData = {
  title: '',
  problemDescription: '',
  companyContext: '',
  participationRules: '',
  startDate: '',
  endDate: '',
  isPrivate: false,
  status: 'Borrador',
};

interface ChallengeFormViewProps {
  onBack: () => void;
  onSave: (data: FormData) => Promise<void>;
  challenge?: Challenge | null;
}

const ChallengeFormView: React.FC<ChallengeFormViewProps> = ({ onBack, onSave, challenge }) => {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEditMode = !!challenge;

  useEffect(() => {
    if (challenge) {
      setForm({
        title: challenge.title || '',
        problemDescription: challenge.problemDescription || '',
        companyContext: challenge.companyContext || '',
        participationRules: challenge.participationRules || '',
        startDate: challenge.startDate ? new Date(challenge.startDate).toISOString().split('T')[0] : '',
        endDate: challenge.endDate ? new Date(challenge.endDate).toISOString().split('T')[0] : '',
        isPrivate: challenge.isPrivate || false,
        status: challenge.status || 'Borrador',
      });
      setDirty(false);
    } else {
      setForm(emptyForm);
      setDirty(false);
    }
    setErrors({});
  }, [challenge]);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!form.title.trim()) errs.title = 'El título es obligatorio';
    else if (form.title.length > LIMITS.title) errs.title = `Máximo ${LIMITS.title} caracteres`;
    if (form.problemDescription.length > LIMITS.problemDescription)
      errs.problemDescription = `Máximo ${LIMITS.problemDescription} caracteres`;
    if (!form.startDate) errs.startDate = 'La fecha de inicio es obligatoria';
    if (!form.endDate) errs.endDate = 'La fecha fin es obligatoria';
    else if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate))
      errs.endDate = 'La fecha fin debe ser posterior al inicio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBack = () => {
    if (dirty) { setShowConfirm(true); return; }
    onBack();
  };

  const handleSave = async (status: ChallengeStatus) => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ ...form, status });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(t => {
      t.style.height = 'auto';
      t.style.height = `${t.scrollHeight}px`;
    });
  }, [form.problemDescription, form.companyContext, form.participationRules]);

  return (
    <Container>
      <TopRow>
        <BackBtn onClick={handleBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a Mis Retos
        </BackBtn>
        <FormTitle>{isEditMode ? 'Editar Reto' : 'Crear Nuevo Reto'}</FormTitle>
      </TopRow>

      {showConfirm && (
        <ConfirmBanner>
          <ConfirmText>Tienes cambios sin guardar. Si sales ahora, perderás la información.</ConfirmText>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => setShowConfirm(false)}>Seguir editando</Btn>
            <Btn $primary style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => { setShowConfirm(false); setDirty(false); onBack(); }}>
              Salir sin guardar
            </Btn>
          </div>
        </ConfirmBanner>
      )}

      <FormCard>
        <FormGrid>
          {/* Title - full width */}
        <FullSpan>
          <FieldGroup>
            <Label>Título del reto *</Label>
            <InputField
              placeholder="Ej: Optimización de procesos logísticos"
              value={form.title}
              onChange={e => updateField('title', e.target.value)}
              $error={!!errors.title}
              maxLength={LIMITS.title + 10}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.title ? <ErrorText>{errors.title}</ErrorText> : <span />}
              <CharCount $over={form.title.length > LIMITS.title}>
                {form.title.length}/{LIMITS.title}
              </CharCount>
            </div>
          </FieldGroup>
        </FullSpan>

        {/* Problem Description - left column */}
        <FieldGroup>
          <Label>Descripción del problema</Label>
          <TextAreaField
            placeholder="Describe el problema que quieres resolver..."
            value={form.problemDescription}
            onChange={e => updateField('problemDescription', e.target.value)}
            $error={!!errors.problemDescription}
            rows={2}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {errors.problemDescription ? <ErrorText>{errors.problemDescription}</ErrorText> : <span />}
            <CharCount $over={form.problemDescription.length > LIMITS.problemDescription}>
              {form.problemDescription.length}/{LIMITS.problemDescription}
            </CharCount>
          </div>
        </FieldGroup>

        {/* Company Context - right column */}
        <FieldGroup>
          <Label>Contexto de la empresa</Label>
          <TextAreaField
            placeholder="Información relevante sobre tu empresa..."
            value={form.companyContext}
            onChange={e => updateField('companyContext', e.target.value)}
            rows={2}
          />
          <CharCount $over={form.companyContext.length > LIMITS.companyContext}>
            {form.companyContext.length}/{LIMITS.companyContext}
          </CharCount>
        </FieldGroup>

        {/* Participation Rules - left */}
        <FieldGroup>
          <Label>Reglas de participación</Label>
          <TextAreaField
            placeholder="Reglas o restricciones para las ideas..."
            value={form.participationRules}
            onChange={e => updateField('participationRules', e.target.value)}
            rows={2}
          />
          <CharCount $over={form.participationRules.length > LIMITS.participationRules}>
            {form.participationRules.length}/{LIMITS.participationRules}
          </CharCount>
        </FieldGroup>

        {/* Dates + Private - right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldGroup>
              <Label>Fecha inicio *</Label>
              <InputField
                type="date"
                value={form.startDate}
                onChange={e => updateField('startDate', e.target.value)}
                $error={!!errors.startDate}
              />
              {errors.startDate && <ErrorText>{errors.startDate}</ErrorText>}
            </FieldGroup>
            <FieldGroup>
              <Label>Fecha cierre *</Label>
              <InputField
                type="date"
                value={form.endDate}
                onChange={e => updateField('endDate', e.target.value)}
                $error={!!errors.endDate}
              />
              {errors.endDate && <ErrorText>{errors.endDate}</ErrorText>}
            </FieldGroup>
          </div>
          <CheckboxRow>
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={e => updateField('isPrivate', e.target.checked)}
              style={{ width: 18, height: 18, accentColor: Pista8Theme.primary }}
            />
            Reto privado (solo con token)
          </CheckboxRow>
        </div>

          {/* Actions - full width */}
          <FullSpan>
            <BtnRow>
              <Btn type="button" onClick={handleBack}>Cancelar</Btn>
              {!isEditMode && (
                <Btn type="button" disabled={saving} onClick={() => handleSave('Borrador')}>
                  Guardar borrador
                </Btn>
              )}
              <Btn $primary disabled={saving} onClick={() => handleSave('Activo')}>
                {saving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Publicar reto'}
              </Btn>
            </BtnRow>
          </FullSpan>
        </FormGrid>
      </FormCard>
    </Container>
  );
};

export default ChallengeFormView;
