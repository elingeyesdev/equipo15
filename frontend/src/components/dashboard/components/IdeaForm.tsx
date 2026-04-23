import React from 'react';
import { createPortal } from 'react-dom';
import * as S from '../styles/FormStyles';
import * as FM from '../styles/FeedbackAndMiscStyles';
import { FEEDBACK_GLYPH } from '../styles/CommonStyles';
import { useIdeationForm } from '../hooks/useIdeationForm';
import type { ConsentKey } from '../hooks/useIdeationForm';

interface IdeaFormProps {
  open: boolean;
  challenge: any;
  fullName: string;
  isGuest: boolean;
  onClose: () => void;
  form: ReturnType<typeof useIdeationForm>;
  onConfirm: () => void;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
}

const IdeaForm: React.FC<IdeaFormProps> = ({
  open, challenge, fullName, isGuest, onClose, form, onConfirm, confirmOpen, setConfirmOpen
}) => {
  if (!open) return null;

  const checklist = [
    { label: 'Reto asignado', done: !!challenge },
    { label: 'Nombre de la idea (5-20 palabras)', done: form.isTitleValid },
    { label: 'Solución propuesta (30-200 palabras)', done: form.isSolutionValid },
    { label: 'Consentimientos', done: Object.values(form.consents).every(Boolean) },
  ];

  const consentItems: Array<{ key: ConsentKey; title: string; desc: string }> = [
    { key: 'terms', title: 'Aceptación de términos', desc: 'Acepto las políticas del programa y la guía de participación institucional.' },
    { key: 'usage', title: 'Autorización de uso de la idea', desc: 'Autorizo a la universidad a compartir y prototipar esta propuesta dando el crédito correspondiente.' },
    { key: 'originality', title: 'Declaración de originalidad', desc: 'Declaro que la idea es resultado de mi trabajo y citando cualquier referencia externa.' },
  ];

  const maxIdeaName = 150;
  const maxIdeaSolution = 1000;
  const maxTags = 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profileStatus = form.isProfileComplete();
    if (!profileStatus.complete) {
      let msg = "";
      if (!profileStatus.hasCode && !profileStatus.hasPhone) msg = "¡Casi listo! Necesitamos tu código de estudiante y teléfono para que la universidad pueda contactarte si tu idea es seleccionada.";
      else if (!profileStatus.hasCode) msg = "¡Ya casi! Solo nos falta tu código de estudiante para validar tu participación.";
      else if (!profileStatus.hasPhone) msg = "¡Solo un paso más! Ingresa tu teléfono para que podamos contactarte.";

      form.setFormFeedback({
        tone: 'info',
        title: 'Perfil incompleto',
        message: msg
      });

      const scrollContainer = document.querySelector('[role="dialog"]');
      if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const errors = form.validatePublicSubmission(challenge);
    if (Object.keys(errors).length === 0) {
      setConfirmOpen(true);
    }
  };

  const modalContent = (
    <>
      <S.ModalBackdrop onClick={onClose} />
      <S.ModalWrapper role="dialog" aria-modal="true" aria-labelledby="idea-form-title">
        <S.ModalCard>
          <S.ModalHalo />
          <S.ModalHeader>
            <div>
              <S.ModalEyebrow>E02 / Formulario Estructurado - Modelo NASA</S.ModalEyebrow>
              <S.ModalTitle id="idea-form-title">{challenge?.title || 'Selecciona un reto'}</S.ModalTitle>
              <S.ModalLead>
                Comparte tu propuesta para este reto. Puedes guardar conceptos en borrador o compartirlos con el hub de innovación.
              </S.ModalLead>
            </div>
            <S.ModalClose type="button" onClick={onClose} aria-label="Cerrar formulario">×</S.ModalClose>
          </S.ModalHeader>

          <S.FormGrid>
            <S.MetaColumn>
              <S.MetaCard>
                <S.MetaLabel>Nombre completo</S.MetaLabel>
                <S.MetaValue>{fullName}</S.MetaValue>
                <S.MetaFoot>{isGuest ? 'Participando como invitado (Guest)' : 'Sesión autenticada'}</S.MetaFoot>
              </S.MetaCard>

              <S.MetaCard $invalid={Boolean(form.formErrors.challenge)}>
                <S.MetaLabel>Reto que respondes</S.MetaLabel>
                <S.MetaValue>{challenge?.title || 'Selecciona un reto'}</S.MetaValue>
                {challenge && <S.MetaBadge>{challenge.category}</S.MetaBadge>}
                <S.MetaFoot>
                  {challenge ? `${challenge.ideasCount ?? 0} ideas publicadas en este reto` : 'Elige un reto para asociar tu idea.'}
                </S.MetaFoot>
                {form.formErrors.challenge && <S.MetaError>{form.formErrors.challenge}</S.MetaError>}
              </S.MetaCard>

              <S.Checklist>
                {checklist.map(item => (
                  <S.ChecklistItem key={item.label}>
                    <S.StatusDot done={item.done} />
                    <S.ChecklistLabel>{item.label}</S.ChecklistLabel>
                  </S.ChecklistItem>
                ))}
              </S.Checklist>
            </S.MetaColumn>

            <S.FormCard onSubmit={handleSubmit}>
              {form.formFeedback && (
                <S.FeedbackBanner $tone={form.formFeedback.tone} role={form.formFeedback.tone === 'error' || form.formFeedback.tone === 'critical' ? 'alert' : 'status'}>
                  <S.BannerGlyph aria-hidden="true">{FEEDBACK_GLYPH[form.formFeedback.tone]}</S.BannerGlyph>
                  <div>
                    {form.formFeedback.title && <S.BannerTitle>{form.formFeedback.title}</S.BannerTitle>}
                    <p>{form.formFeedback.message}</p>
                  </div>
                </S.FeedbackBanner>
              )}

              <S.Field>
                <S.FieldHeader>
                  <S.Label>Nombre y/o info básica de la idea</S.Label>
                  <S.CharCounter>{form.titleWords} palabras ({form.minTitleWords}-{form.maxTitleWords})</S.CharCounter>
                </S.FieldHeader>
                <S.Tip>Usa un titular memorable de máximo {maxIdeaName} caracteres.</S.Tip>
                <S.TextInput
                  value={form.ideaName}
                  onChange={e => {
                    form.setIdeaName(e.target.value);
                    if (form.formErrors.ideaName) form.clearFieldError('ideaName');
                  }}
                  onBlur={() => form.validateField('ideaName', challenge)}
                  placeholder="Ej. Corredor solar para el campus central"
                  maxLength={maxIdeaName}
                  $invalid={Boolean(form.formErrors.ideaName)}
                />
                {form.formErrors.ideaName && <S.FieldError>{form.formErrors.ideaName}</S.FieldError>}
              </S.Field>

              <S.Field>
                <S.FieldHeader>
                  <S.Label>La Propuesta</S.Label>
                  <S.CharCounter>{form.solutionWords} palabras ({form.minSolutionWords}-{form.maxSolutionWords})</S.CharCounter>
                </S.FieldHeader>
                <S.Tip>
                  ¿Cómo funciona tu solución y cuál es su impacto? Necesitas mínimo {form.minSolutionWords} palabras para poder lanzar el avión.
                </S.Tip>
                <S.TextArea
                  value={form.ideaSolution}
                  onChange={e => {
                    form.setIdeaSolution(e.target.value);
                    if (form.formErrors.ideaSolution) form.clearFieldError('ideaSolution');
                  }}
                  onBlur={() => form.validateField('ideaSolution', challenge)}
                  placeholder="Describe los pasos, recursos y el cambio positivo que generará..."
                  rows={5}
                  maxLength={maxIdeaSolution}
                  $invalid={Boolean(form.formErrors.ideaSolution)}
                />
                {form.formErrors.ideaSolution && <S.FieldError>{form.formErrors.ideaSolution}</S.FieldError>}
              </S.Field>

              <S.Field>
                <S.FieldHeader>
                  <S.Label>Etiquetas</S.Label>
                  <S.TagCounter>{form.tags.length}/{maxTags}</S.TagCounter>
                </S.FieldHeader>
                <S.Tip>Agrega palabras clave y presiona Enter o coma para guardarlas.</S.Tip>
                <S.TagInputWrap>
                  {form.tags.map(tag => (
                    <S.TagChip key={tag}>
                      {tag}
                      <S.RemoveTag type="button" onClick={() => form.handleTagRemoval(tag)} aria-label={`Quitar etiqueta ${tag}`}>×</S.RemoveTag>
                    </S.TagChip>
                  ))}
                  <S.TagField
                    type="text"
                    value={form.tagInput}
                    onChange={e => form.setTagInput(e.target.value)}
                    onKeyDown={form.handleTagKeyDown}
                    placeholder="impacto, movilidad, energía..."
                    disabled={form.tags.length >= maxTags}
                  />
                  <S.AddTagButton type="button" onClick={form.handleTagAddition} disabled={form.tags.length >= maxTags}>Añadir</S.AddTagButton>
                </S.TagInputWrap>
              </S.Field>

              <S.Field>
                <S.Label>Consentimientos y condiciones</S.Label>
                <S.Tip>Marca cada casilla para habilitar el envío.</S.Tip>
                <S.ConsentList $invalid={Boolean(form.formErrors.consents) && form.consentsTouched}>
                  {consentItems.map(item => (
                    <S.ConsentItem key={item.key} checked={form.consents[item.key]}>
                      <S.ConsentCheckbox
                        type="checkbox"
                        checked={form.consents[item.key]}
                        onChange={() => form.toggleConsent(item.key)}
                      />
                      <div>
                        <S.ConsentTitle>{item.title}</S.ConsentTitle>
                        <S.ConsentDescription>{item.desc}</S.ConsentDescription>
                      </div>
                    </S.ConsentItem>
                  ))}
                </S.ConsentList>
                {form.formErrors.consents && form.consentsTouched && <S.FieldError>{form.formErrors.consents}</S.FieldError>}
              </S.Field>

              <S.ButtonRow>
                <S.GhostButton type="button" onClick={() => form.handleIdeaSubmit('draft', challenge)} disabled={form.formSaving}>
                  {form.formSaving && form.savingAction === 'draft' ? 'Guardando...' : 'Guardar como borrador'}
                </S.GhostButton>
                <S.CTAButton type="submit" disabled={form.formSaving || !checklist.every(c => c.done) || form.solutionWords < form.minSolutionWords}>
                  {form.formSaving && form.savingAction === 'public' ? 'Enviando...' : 'Lanzar Avión'}
                </S.CTAButton>
              </S.ButtonRow>
              <S.ButtonHint>
                {checklist.every(c => c.done)
                  ? 'Lista para enviarse o guardar cambios en cualquier momento.'
                  : 'Puedes guardar avances como borrador o completar los campos para enviarla.'}
              </S.ButtonHint>
            </S.FormCard>
          </S.FormGrid>
        </S.ModalCard>
      </S.ModalWrapper>

      {confirmOpen && (
        <>
          <FM.ConfirmBackdrop />
          <FM.ConfirmDialog role="dialog" aria-modal="true" aria-labelledby="confirm-submit-title">
            <FM.ConfirmCard>
              <FM.ConfirmTitle id="confirm-submit-title">¿Compartir esta idea con el hub?</FM.ConfirmTitle>
              <FM.ConfirmText>
                {form.ideaName.trim() ? `“${form.ideaName.trim()}”` : 'Tu propuesta'} se enviará a revisión del hub de innovación.
                Confirma para cerrar el formulario y registrar el envío.
              </FM.ConfirmText>
              <FM.ConfirmSummary>
                <FM.SummaryPill>{challenge?.title || 'Reto sin seleccionar'}</FM.SummaryPill>
                <FM.SummaryPill>{form.tags.length} etiquetas</FM.SummaryPill>
              </FM.ConfirmSummary>
              <FM.ConfirmActions>
                <FM.ConfirmGhost type="button" onClick={() => setConfirmOpen(false)} disabled={form.formSaving}>Seguir editando</FM.ConfirmGhost>
                <FM.ConfirmCTA type="button" onClick={onConfirm} disabled={form.formSaving}>
                  {form.formSaving ? 'Enviando...' : 'Sí, compartir'}
                </FM.ConfirmCTA>
              </FM.ConfirmActions>
            </FM.ConfirmCard>
          </FM.ConfirmDialog>
        </>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default IdeaForm;
