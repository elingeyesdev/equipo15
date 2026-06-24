import { useState } from 'react';

import { ideaService, type IdeaDraft } from '../../../services/idea.service';
import type { Challenge, UserProfile } from '../../../types/models';
import {
  IDEA_WORD_RULES,
  countWords,
  getWordRangeError,
  isWordCountInRange,
} from '../helpers/ideaValidation';
import {
  stripDraftProblem,
  stripDraftSolution,
  stripDraftTitle,
} from '../helpers/draftPlaceholders';

export type ConsentKey = 'terms' | 'usage' | 'originality';
export type ImpactArea = 'PRODUCTIVIDAD' | 'COSTOS' | 'CLIENTES' | 'EQUIPO' | 'CRECIMIENTO' | 'SOSTENIBILIDAD' | 'IMPACTO_SOCIAL';
export type ImprovementType = 'OPTIMIZA' | 'POTENCIA' | 'EXPANDE' | 'TRANSFORMA';
export type EffortLevel = 'FACIL_IMPLEMENTAR' | 'REQUIERE_COORDINACION' | 'REQUIERE_DESARROLLO' | 'REQUIERE_TRANSFORMACION';
export type FormErrorKey =
  | 'challenge'
  | 'ideaName'
  | 'ideaProblem'
  | 'ideaSolution'
  | 'consents'
  | 'impactArea'
  | 'improvementType'
  | 'effortLevel';
export type FormErrors = Partial<Record<FormErrorKey, string>>;
export type FeedbackTone = 'success' | 'error' | 'info' | 'critical';

export interface FeedbackMessage {
  tone: FeedbackTone;
  message: string;
  title?: string;
  persist?: boolean;
}

const extractMessage = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return [...new Set(raw)].join(' ');
  return undefined;
};

const interpretBackendError = (error: unknown): FeedbackMessage => {
  const eAny = error as any;
  if (eAny?.code === 'ERR_NETWORK') {
    return {
      tone: 'critical',
      title: 'Sin conexión',
      message:
        'Perdimos contacto con el servidor. Revisa tu red e inténtalo nuevamente.',
      persist: true,
    };
  }

  const status = eAny?.response?.status;
  const backendMessage = extractMessage(eAny?.response?.data?.message);

  if (status === 400) {
    return {
      tone: 'error',
      title: 'Revisa los campos',
      message: backendMessage || 'Hay información pendiente antes de continuar.',
    };
  }

  if (status === 401) {
    return {
      tone: 'critical',
      title: 'Sesión caducada',
      message: 'Vuelve a iniciar sesión para continuar.',
      persist: true,
    };
  }

  if (status && status >= 500) {
    return {
      tone: 'critical',
      title: 'Servicio en pausa',
      message:
        'El hub está teniendo problemas. Estamos trabajando para restablecerlo.',
      persist: true,
    };
  }

  return {
    tone: 'error',
    title: 'No pudimos completar la acción',
    message: backendMessage || 'Intenta nuevamente en unos segundos.',
  };
};

export const useIdeationForm = (
  profile: UserProfile | null,
  isGuest: boolean,
  showToast: (p: FeedbackMessage) => void,
) => {
  const [formSaving, setFormSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<'draft' | 'public' | null>(
    null,
  );
  const [formFeedback, setFormFeedback] = useState<FeedbackMessage | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [consentsTouched, setConsentsTouched] = useState(false);
  const [ideaName, setIdeaName] = useState('');
  const [ideaProblem, setIdeaProblem] = useState('');
  const [ideaSolution, setIdeaSolution] = useState('');
  const [impactArea, setImpactArea] = useState<ImpactArea | ''>('');
  const [improvementType, setImprovementType] = useState<ImprovementType | ''>('');
  const [effortLevel, setEffortLevel] = useState<EffortLevel | ''>('');
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    usage: false,
    originality: false,
  });
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeDraftData, setActiveDraftData] = useState<string | null>(null);

  const minTitleWords = IDEA_WORD_RULES.title.min;
  const maxTitleWords = IDEA_WORD_RULES.title.max;
  const minProblemWords = IDEA_WORD_RULES.problem.min;
  const maxProblemWords = IDEA_WORD_RULES.problem.max;
  const minSolutionWords = IDEA_WORD_RULES.solution.min;
  const maxSolutionWords = IDEA_WORD_RULES.solution.max;
  const isReadOnlyByPenalty = profile?.status === 'SOFT_BLOCK' || profile?.status === 'SUSPENDED';

  const allConsentsAccepted = Object.values(consents).every(Boolean);
  const titleWords = countWords(ideaName);
  const problemWords = countWords(ideaProblem);
  const solutionWords = countWords(ideaSolution);
  const isTitleValid = isWordCountInRange(ideaName, minTitleWords, maxTitleWords);
  const isProblemValid = isWordCountInRange(
    ideaProblem,
    minProblemWords,
    maxProblemWords,
  );
  const isSolutionValid = isWordCountInRange(
    ideaSolution,
    minSolutionWords,
    maxSolutionWords,
  );

  const resetForm = () => {
    setIdeaName('');
    setIdeaProblem('');
    setIdeaSolution('');
    setImpactArea('');
    setImprovementType('');
    setEffortLevel('');
    setConsents({ terms: false, usage: false, originality: false });
    setFormErrors({});
    setConsentsTouched(false);
    setActiveDraftId(null);
    setActiveDraftData(null);
  };

  const loadFromDraft = (draft: IdeaDraft) => {
    setActiveDraftId(draft.id);
    setIdeaName(stripDraftTitle(draft.title));
    setIdeaProblem(stripDraftProblem(draft.problem));
    setIdeaSolution(stripDraftSolution(draft.solution));
    setImpactArea((draft.impactArea as ImpactArea) || '');
    setImprovementType((draft.improvementType as ImprovementType) || '');
    setEffortLevel((draft.effortLevel as EffortLevel) || '');
    setFormErrors({});
    setConsentsTouched(false);

    const draftSnapshot = JSON.stringify({
      title: stripDraftTitle(draft.title),
      problem: stripDraftProblem(draft.problem),
      solution: stripDraftSolution(draft.solution),
      impactArea: (draft.impactArea as ImpactArea) || '',
      improvementType: (draft.improvementType as ImprovementType) || '',
      effortLevel: (draft.effortLevel as EffortLevel) || '',
    });
    setActiveDraftData(draftSnapshot);
    showToast({
      tone: 'info',
      title: '¡Borrador recuperado!',
      message: 'Ya puedes seguir dándole forma a tu propuesta.',
    });
  };

  const clearFieldError = (field: FormErrorKey) => {
    setFormErrors(prev => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const getFieldError = (
    field: FormErrorKey,
    formChallenge: Challenge | null,
  ): string | undefined => {
    if (field === 'challenge' && !formChallenge) {
      return 'Selecciona un reto para vincular tu propuesta.';
    }
    if (field === 'ideaName') {
      return getWordRangeError('El título', ideaName, minTitleWords, maxTitleWords);
    }
    if (field === 'ideaProblem') {
      return getWordRangeError('El problema', ideaProblem, minProblemWords, maxProblemWords);
    }
    if (field === 'ideaSolution') {
      return getWordRangeError('La solución', ideaSolution, minSolutionWords, maxSolutionWords);
    }
    if (field === 'consents' && !allConsentsAccepted) {
      return 'Acepta los tres consentimientos (ejemplo: si “App para Bienestar Estudiantil” llega al laboratorio, debemos poder prototiparla citándote).';
    }
    if (field === 'impactArea' && !impactArea) {
      return 'Selecciona el área de impacto de tu idea.';
    }
    if (field === 'improvementType' && !improvementType) {
      return 'Selecciona el tipo de mejora que propone tu idea.';
    }
    if (field === 'effortLevel' && !effortLevel) {
      return 'Selecciona el nivel de esfuerzo requerido para implementar la idea.';
    }
    return undefined;
  };

  const validateField = (field: FormErrorKey, formChallenge: Challenge | null) => {
    const errorMessage = getFieldError(field, formChallenge);
    setFormErrors(prev => {
      const next = { ...prev };
      if (errorMessage) next[field] = errorMessage;
      else delete next[field];
      return next;
    });
    return !errorMessage;
  };

  const isProfileComplete = () => {
    return { hasCode: true, hasPhone: true, complete: true };
  };

  const validatePublicSubmission = (formChallenge: Challenge | null): FormErrors => {
    const errors: FormErrors = {};
    (
      ['challenge', 'ideaName', 'ideaSolution', 'consents', 'impactArea', 'improvementType', 'effortLevel'] as FormErrorKey[]
    ).forEach(field => {
      const errorMessage = getFieldError(field, formChallenge);
      if (errorMessage) errors[field] = errorMessage;
    });
    return errors;
  };

  const toggleConsent = (key: ConsentKey) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
    setConsentsTouched(true);
  };

  const handleIdeaSubmit = async (
    targetStatus: 'draft' | 'public',
    formChallenge: Challenge | null,
    onDraftSaved?: () => void,
  ): Promise<boolean> => {
    if (!profile?.id) {
      const message = {
        tone: 'critical' as FeedbackTone,
        title: 'Perfil no disponible',
        message:
          'Necesitamos sincronizar tu sesión nuevamente antes de continuar.',
        persist: true,
      };
      setFormFeedback(message);
      showToast(message);
      return false;
    }

    if (isReadOnlyByPenalty) {
      const blockedMessage: FeedbackMessage = {
        tone: 'critical',
        title: 'Cuenta en modo lectura',
        message: 'Durante la sanción solo puedes consultar contenido. No puedes enviar ni guardar ideas.',
        persist: true,
      };
      setFormFeedback(blockedMessage);
      showToast(blockedMessage);
      return false;
    }

    if (!formChallenge) {
      setFormFeedback({
        tone: 'info',
        title: 'Elige un reto',
        message: 'Vincula tu idea a uno de los retos activos antes de continuar.',
      });
      return false;
    }

    const title = ideaName.trim();

    if (targetStatus === 'public') {
      const publicErrors = validatePublicSubmission(formChallenge);
      setFormErrors(publicErrors);
      setConsentsTouched(true);
      if (Object.keys(publicErrors).length) {
        setFormFeedback({
          tone: 'error',
          title: 'Revisa los campos',
          message: 'Corrige los campos marcados en rojo antes de compartir tu idea.',
        });
        return false;
      }
    }

    setFormSaving(true);
    setSavingAction(targetStatus);
    setFormFeedback(null);

    let success = false;
    try {
      if (targetStatus === 'draft') {
        const payload = {
          title: title || undefined,
          problem: ideaProblem.trim() || undefined,
          solution: ideaSolution.trim() || undefined,
          challengeId: formChallenge?.id,
          isAnonymous: isGuest,
          impactArea: impactArea || undefined,
          improvementType: improvementType || undefined,
          effortLevel: effortLevel || undefined,
        };

        const currentSnapshot = JSON.stringify({
          title: title || '',
          problem: ideaProblem.trim() || '',
          solution: ideaSolution.trim() || '',
          impactArea: impactArea || '',
          improvementType: improvementType || '',
          effortLevel: effortLevel || '',
        });

        if (activeDraftId && activeDraftData === currentSnapshot) {
          showToast({
            tone: 'info',
            title: 'Sin cambios',
            message: 'El borrador ya está guardado con esta información.',
          });
          setFormSaving(false);
          return false;
        }
        if (activeDraftId) {
          await ideaService.updateDraftIdea(activeDraftId, payload);
        } else {
          const created = await ideaService.saveDraftIdea(payload);
          const createdId = (created as { data?: { id?: string }; id?: string })?.data?.id
            ?? (created as { id?: string })?.id;
          if (createdId) setActiveDraftId(createdId);
        }
        const draftMessage: FeedbackMessage = {
          tone: 'success',
          title: '¡Avances guardados!',
          message: 'Tu borrador te espera en el panel para cuando quieras seguir.',
        };
        showToast(draftMessage);
        resetForm();
        onDraftSaved?.();
        success = true;
      } else {
        const normalizedProblem =
          ideaProblem.trim() || ideaSolution.trim() || ideaName.trim();
        await ideaService.createIdea({
          title: ideaName.trim(),
          problem: normalizedProblem,
          solution: ideaSolution.trim(),
          status: targetStatus,
          challengeId: formChallenge.id,
          isAnonymous: isGuest,
          impactArea: impactArea || undefined,
          improvementType: improvementType || undefined,
          effortLevel: effortLevel || undefined,
        });

        if (activeDraftId) {
          try {
            await ideaService.deleteDraftIdea(activeDraftId);
            onDraftSaved?.();
          } catch {
            // Publicación exitosa aunque falle limpiar el borrador previo.
          }
        }

        resetForm();
        success = true;
      }
    } catch (error: unknown) {
      const backendDetails = (error as any)?.response?.data?.details as
        | Partial<Record<FormErrorKey, string>>
        | undefined;
      if (backendDetails) {
        setFormErrors(prev => ({ ...prev, ...backendDetails }));
      }
      const interpreted = interpretBackendError(error);
      setFormFeedback(interpreted);
      if (interpreted.persist || interpreted.tone === 'critical') {
        showToast(interpreted);
      }
    } finally {
      setFormSaving(false);
      setSavingAction(null);
    }
    return success;
  };

  return {
    ideaName,
    setIdeaName,
    ideaProblem,
    setIdeaProblem,
    ideaSolution,
    setIdeaSolution,
    impactArea,
    setImpactArea,
    improvementType,
    setImprovementType,
    effortLevel,
    setEffortLevel,
    titleWords,
    problemWords,
    solutionWords,
    minTitleWords,
    maxTitleWords,
    minProblemWords,
    maxProblemWords,
    minSolutionWords,
    maxSolutionWords,
    isTitleValid,
    isProblemValid,
    isSolutionValid,
    consents,
    toggleConsent,
    consentsTouched,
    setConsentsTouched,
    formErrors,
    setFormErrors,
    clearFieldError,
    validateField,
    validatePublicSubmission,
    formSaving,
    savingAction,
    formFeedback,
    setFormFeedback,
    isProfileComplete,
    handleIdeaSubmit,
    resetForm,
    loadFromDraft,
    activeDraftId,
    isReadOnlyByPenalty,
  };
};
