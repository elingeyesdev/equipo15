import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import * as S from '../../dashboard/styles/FormStyles';
import { ideaService } from '@/services/idea.service';
import { IDEA_WORD_RULES, countWords, isWordCountInRange } from '../../dashboard/helpers/ideaValidation';

interface EditIdeaModalProps {
  idea: {
    id: string;
    title: string;
    problem?: string;
    solution?: string;
  };
  onClose: () => void;
  onSaveSuccess: (updatedIdea: any) => void;
}

export function EditIdeaModal({ idea, onClose, onSaveSuccess }: EditIdeaModalProps) {
  const [title, setTitle] = useState(idea.title || '');
  const [solution, setSolution] = useState(idea.solution || idea.problem || '');
  const [saving, setSaving] = useState(false);

  const titleWordCount = countWords(title);
  const solutionWordCount = countWords(solution);

  const isTitleValid = isWordCountInRange(title, IDEA_WORD_RULES.title.min, IDEA_WORD_RULES.title.max);
  const isSolutionValid = isWordCountInRange(solution, IDEA_WORD_RULES.solution.min, IDEA_WORD_RULES.solution.max);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTitleValid) {
      toast.error(`El título debe tener entre ${IDEA_WORD_RULES.title.min} y ${IDEA_WORD_RULES.title.max} palabras.`);
      return;
    }
    if (!isSolutionValid) {
      toast.error(`La propuesta debe tener entre ${IDEA_WORD_RULES.solution.min} y ${IDEA_WORD_RULES.solution.max} palabras.`);
      return;
    }

    setSaving(true);
    try {
      const updated = await ideaService.updateIdea(idea.id, {
        title,
        problem: solution, // Keep in sync
        solution,
      });
      toast.success('Propuesta actualizada con éxito.');
      onSaveSuccess(updated.data || updated);
      onClose();
    } catch (err) {
      toast.error('No se pudo actualizar la propuesta.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <S.ModalBackdrop onClick={onClose} />
      <S.ModalWrapper onClick={onClose}>
        <S.ModalCard onClick={(e) => e.stopPropagation()} style={{ width: 'min(760px, 100%)' }}>
          <S.ModalHalo />
          <S.ModalHeader>
            <div>
              <S.ModalEyebrow>Edición de propuesta</S.ModalEyebrow>
              <S.ModalTitle>Modificar Idea</S.ModalTitle>
              <S.ModalLead>Edita los detalles de tu propuesta dentro del plazo de 24 horas.</S.ModalLead>
            </div>
            <S.ModalClose onClick={onClose}>×</S.ModalClose>
          </S.ModalHeader>

          <S.FormCard onSubmit={handleSubmit}>
            <S.Field>
              <S.FieldHeader>
                <S.Label htmlFor="edit-title">Título de la Idea</S.Label>
                <S.CharCounter style={{ color: isTitleValid ? '#22c55e' : '#f59e0b' }}>
                  {titleWordCount} / {IDEA_WORD_RULES.title.max} palabras (min {IDEA_WORD_RULES.title.min})
                </S.CharCounter>
              </S.FieldHeader>
              <S.TextInput
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                $invalid={!isTitleValid && titleWordCount > 0}
                required
              />
            </S.Field>

            <S.Field>
              <S.FieldHeader>
                <S.Label htmlFor="edit-solution">La Propuesta</S.Label>
                <S.CharCounter style={{ color: isSolutionValid ? '#22c55e' : '#f59e0b' }}>
                  {solutionWordCount} / {IDEA_WORD_RULES.solution.max} palabras (min {IDEA_WORD_RULES.solution.min})
                </S.CharCounter>
              </S.FieldHeader>
              <S.TextArea
                id="edit-solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                $invalid={!isSolutionValid && solutionWordCount > 0}
                required
              />
            </S.Field>

            <S.ButtonRow>
              <S.GhostButton type="button" onClick={onClose} disabled={saving}>
                Cancelar
              </S.GhostButton>
              <S.CTAButton type="submit" disabled={saving || !isTitleValid || !isSolutionValid}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </S.CTAButton>
            </S.ButtonRow>
          </S.FormCard>
        </S.ModalCard>
      </S.ModalWrapper>
    </>,
    document.body
  );
}
