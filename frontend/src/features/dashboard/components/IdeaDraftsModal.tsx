import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import * as FM from '../styles/FeedbackAndMiscStyles';
import * as S from '../styles/FormStyles';
import type { IdeaDraft } from '../../../services/idea.service';
import {
  IMPACT_AREA_OPTIONS,
  IMPROVEMENT_TYPE_OPTIONS,
  EFFORT_LEVEL_OPTIONS,
} from '../constants/ideaClassificationOptions';
import {
  stripDraftProblem,
  stripDraftSolution,
  stripDraftTitle,
} from '../helpers/draftPlaceholders';

interface IdeaDraftsModalProps {
  open: boolean;
  onClose: () => void;
  drafts: IdeaDraft[];
  loading: boolean;
  deletingDraftId: string | null;
  onContinue: (draft: IdeaDraft) => void;
  onDelete: (draftId: string) => Promise<boolean>;
}

const labelFor = (
  value: string | null | undefined,
  options: Array<{ value: string; label: string }>,
) => options.find(o => o.value === value)?.label ?? 'Sin definir';

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const IdeaDraftsModal: React.FC<IdeaDraftsModalProps> = ({
  open,
  onClose,
  drafts,
  loading,
  deletingDraftId,
  onContinue,
  onDelete,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState('');

  if (!open) return null;

  const handleDeleteRequest = (draft: IdeaDraft) => {
    setConfirmDeleteId(draft.id);
    setConfirmDeleteTitle(stripDraftTitle(draft.title) || 'Borrador sin título');
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const success = await onDelete(confirmDeleteId);
    if (success) {
      setConfirmDeleteId(null);
      setConfirmDeleteTitle('');
    }
  };

  const modalContent = (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,10,18,0.55)',
          zIndex: 10003,
          backdropFilter: 'blur(3px)',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drafts-modal-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 10004,
          background: 'white',
          borderRadius: 24,
          padding: '32px 28px',
          width: 'min(720px, 94vw)',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 16 }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a8b0b8' }}>
              Tus avances guardados
            </p>
            <h2 id="drafts-modal-title" style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1a1f22' }}>
              Borradores de ideas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar borradores"
            style={{
              background: 'rgba(72,80,84,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 20,
              cursor: 'pointer',
              color: '#485054',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Cargando borradores...</p>
        ) : drafts.length === 0 ? (
          <S.DraftsEmpty>
            <p>No tienes borradores guardados todavía.</p>
            <span>Usa “Guardar como borrador” para retomar tu idea más tarde.</span>
          </S.DraftsEmpty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {drafts.map(draft => {
              const title = stripDraftTitle(draft.title) || 'Borrador sin título';
              const solution = stripDraftSolution(draft.solution);
              const problem = stripDraftProblem(draft.problem);
              const isDeleting = deletingDraftId === draft.id;

              return (
                <S.DraftCard key={draft.id}>
                  <S.DraftCardHeader>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <S.DraftCardTitle>{title}</S.DraftCardTitle>
                      <S.DraftCardMeta>
                        {draft.challenge?.title || 'Reto sin título'} · Actualizado {formatDate(draft.updatedAt)}
                      </S.DraftCardMeta>
                    </div>
                  </S.DraftCardHeader>

                  {solution && (
                    <S.DraftCardExcerpt>{solution}</S.DraftCardExcerpt>
                  )}
                  {!solution && problem && (
                    <S.DraftCardExcerpt>{problem}</S.DraftCardExcerpt>
                  )}

                  <S.DraftCardTags>
                    <S.DraftChip>{labelFor(draft.impactArea, IMPACT_AREA_OPTIONS)}</S.DraftChip>
                    <S.DraftChip>{labelFor(draft.improvementType, IMPROVEMENT_TYPE_OPTIONS)}</S.DraftChip>
                    <S.DraftChip>{labelFor(draft.effortLevel, EFFORT_LEVEL_OPTIONS)}</S.DraftChip>
                    {draft.tags?.slice(0, 3).map(tag => (
                      <S.DraftChip key={tag} $muted>{tag}</S.DraftChip>
                    ))}
                  </S.DraftCardTags>

                  <S.DraftCardActions>
                    <S.DraftActionButton
                      type="button"
                      $primary
                      onClick={() => onContinue(draft)}
                      disabled={isDeleting}
                    >
                      Continuar
                    </S.DraftActionButton>
                    <S.DraftActionButton
                      type="button"
                      $danger
                      onClick={() => handleDeleteRequest(draft)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </S.DraftActionButton>
                  </S.DraftCardActions>
                </S.DraftCard>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <>
          <FM.ConfirmBackdrop style={{ zIndex: 10005 }} />
          <FM.ConfirmDialog role="dialog" aria-modal="true" style={{ zIndex: 10006 }}>
            <FM.ConfirmCard>
              <FM.ConfirmTitle>¿Eliminar este borrador?</FM.ConfirmTitle>
              <FM.ConfirmText>
                Se eliminará permanentemente “{confirmDeleteTitle}”. Esta acción no se puede deshacer.
              </FM.ConfirmText>
              <FM.ConfirmActions>
                <FM.ConfirmGhost
                  type="button"
                  onClick={() => {
                    setConfirmDeleteId(null);
                    setConfirmDeleteTitle('');
                  }}
                  disabled={Boolean(deletingDraftId)}
                >
                  Cancelar
                </FM.ConfirmGhost>
                <FM.ConfirmCTA
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={Boolean(deletingDraftId)}
                  style={{ background: '#dc2626' }}
                >
                  {deletingDraftId ? 'Eliminando...' : 'Sí, eliminar'}
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

export default IdeaDraftsModal;
