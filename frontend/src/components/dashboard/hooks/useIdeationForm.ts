import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ideaService } from '../../../services/idea.service';
import type { Challenge, UserProfile } from '../../../types/models';
import {
  IDEA_WORD_RULES,
  countWords,
  getWordRangeError,
  isWordCountInRange,
} from '../helpers/ideaValidation';

export type ConsentKey = 'terms' | 'usage' | 'originality';
export type FormErrorKey =
  | 'challenge'
  | 'ideaName'
  | 'ideaProblem'
  | 'ideaSolution'
  | 'consents';
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
  if (Array.isArray(raw)) return raw.join(' ');
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    usage: false,
    originality: false,
  });

  const minTitleWords = IDEA_WORD_RULES.title.min;
  const maxTitleWords = IDEA_WORD_RULES.title.max;
  const minProblemWords = IDEA_WORD_RULES.problem.min;
  const maxProblemWords = IDEA_WORD_RULES.problem.max;
  const minSolutionWords = IDEA_WORD_RULES.solution.min;
  const maxSolutionWords = IDEA_WORD_RULES.solution.max;
  const maxTags = 6;
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
    setTags([]);
    setTagInput('');
    setConsents({ terms: false, usage: false, originality: false });
    setFormErrors({});
    setConsentsTouched(false);
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
      return getWordRangeError(
        'El problema',
        ideaProblem,
        minProblemWords,
        maxProblemWords,
      );
    }
    if (field === 'ideaSolution') {
      return getWordRangeError(
        'La solución',
        ideaSolution,
        minSolutionWords,
        maxSolutionWords,
      );
    }
    if (field === 'consents' && !allConsentsAccepted) {
      return 'Acepta los tres consentimientos (ejemplo: si “App para Bienestar Estudiantil” llega al laboratorio, debemos poder prototiparla citándote).';
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
    const role = profile?.role || 'student';
    const hasPhone = !!profile?.phone?.trim();

    if (role === 'student') {
      const hasCode = !!profile?.studentCode?.trim();
      return { hasCode, hasPhone, complete: hasCode && hasPhone };
    }

    return { hasCode: true, hasPhone, complete: hasPhone };
  };

  const validatePublicSubmission = (formChallenge: Challenge | null): FormErrors => {
    const errors: FormErrors = {};
    (
      ['challenge', 'ideaName', 'ideaSolution', 'consents'] as FormErrorKey[]
    ).forEach(field => {
      const errorMessage = getFieldError(field, formChallenge);
      if (errorMessage) errors[field] = errorMessage;
    });
    return errors;
  };

  const handleTagAddition = () => {
    const sanitized = tagInput.trim();
    if (!sanitized) return;
    setTags(prev => {
      if (prev.includes(sanitized) || prev.length >= maxTags) return prev;
      return [...prev, sanitized];
    });
    setTagInput('');
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleTagAddition();
    }
    if (event.key === 'Backspace' && !tagInput && tags.length) {
      event.preventDefault();
      setTags(prev => prev.slice(0, -1));
    }
  };

  const handleTagRemoval = (target: string) => {
    setTags(prev => prev.filter(tag => tag !== target));
  };

  const toggleConsent = (key: ConsentKey) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
    setConsentsTouched(true);
  };

  const handleIdeaSubmit = async (
    targetStatus: 'draft' | 'public',
    formChallenge: Challenge | null,
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
    const normalizedTags = () =>
      Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));

    if (targetStatus === 'public') {
      const hasCode = !!profile?.studentCode?.trim();
      const hasPhone = !!profile?.phone?.trim();

      if (!hasCode || !hasPhone) {
        let msg = "";
        if (!hasCode && !hasPhone) msg = "¡Casi listo! Necesitamos tu código de estudiante y teléfono para que la universidad pueda contactarte si tu idea es seleccionada.";
        else if (!hasCode) msg = "¡Ya casi! Solo nos falta tu código de estudiante para validar tu participación.";
        else if (!hasPhone) msg = "¡Solo un paso más! Ingresa tu teléfono para que podamos contactarte.";

        const warning: FeedbackMessage = {
          tone: 'info',
          title: 'Perfil incompleto',
          message: msg
        };
        setFormFeedback(warning);
        return false;
      }

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
          tags: normalizedTags(),
          challengeId: formChallenge?.id,
          isAnonymous: isGuest,
        };
        await ideaService.saveDraftIdea(payload);
        showToast({
          tone: 'info',
          title: 'Borrador guardado',
          message: 'Guardamos tus avances. Puedes retomarlos cuando quieras.',
        });
        success = true;
      } else {
        const normalizedProblem =
          ideaProblem.trim() || ideaSolution.trim() || ideaName.trim();
        await ideaService.createIdea({
          title: ideaName.trim(),
          problem: normalizedProblem,
          solution: ideaSolution.trim(),
          tags: normalizedTags(),
          status: targetStatus,
          challengeId: formChallenge.id,
          isAnonymous: isGuest,
        });
        const successMessage: FeedbackMessage = {
          tone: 'success',
          title: 'Idea enviada',
          message:
            'Tu propuesta ya está registrada. Te avisaremos si necesitamos más información.',
        };
        setFormFeedback(successMessage);
        showToast(successMessage);
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
    tags,
    tagInput,
    setTagInput,
    handleTagAddition,
    handleTagKeyDown,
    handleTagRemoval,
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
    isReadOnlyByPenalty,
  };
};
