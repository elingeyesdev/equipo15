import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ideaService } from '../../../services/idea.service';
import type { UserProfile } from '../../../services/user.service';

export type ConsentKey = 'terms' | 'usage' | 'originality';
export type FormErrorKey = 'challenge' | 'ideaName' | 'ideaDevelopment' | 'consents';
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

const interpretBackendError = (error: any): FeedbackMessage => {
  if (error?.code === 'ERR_NETWORK') {
    return {
      tone: 'critical',
      title: 'Sin conexión',
      message: 'Perdimos contacto con el servidor. Revisa tu red e inténtalo nuevamente.',
      persist: true,
    };
  }

  const status = error?.response?.status;
  const backendMessage = extractMessage(error?.response?.data?.message);

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
      message: 'El hub está teniendo problemas. Estamos trabajando para restablecerlo.',
      persist: true,
    };
  }

  return {
    tone: 'error',
    title: 'No pudimos completar la acción',
    message: backendMessage || 'Intenta nuevamente en unos segundos.',
  };
};

export const useIdeationForm = (profile: UserProfile | null, isGuest: boolean, showToast: (p: FeedbackMessage) => void) => {
  const [formSaving, setFormSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<'draft' | 'public' | null>(null);
  const [formFeedback, setFormFeedback] = useState<FeedbackMessage | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [consentsTouched, setConsentsTouched] = useState(false);
  const [ideaName, setIdeaName] = useState('');
  const [ideaDevelopment, setIdeaDevelopment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    usage: false,
    originality: false,
  });

  const minIdeaName = 5;
  const minIdeaDevelopment = 20;
  const maxTags = 6;

  const allConsentsAccepted = Object.values(consents).every(Boolean);

  const resetForm = () => {
    setIdeaName('');
    setIdeaDevelopment('');
    setTags([]);
    setTagInput('');
    setConsents({ terms: false, usage: false, originality: false });
    setFormErrors({});
    setConsentsTouched(false);
  };

  const clearFieldError = (field: FormErrorKey) => {
    setFormErrors(prev => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const getFieldError = (field: FormErrorKey, formChallenge: any): string | undefined => {
    if (field === 'challenge' && !formChallenge) return 'Selecciona un reto para vincular tu propuesta.';
    if (field === 'ideaName' && ideaName.trim().length < minIdeaName) return `Ingresa al menos ${minIdeaName} caracteres.`;
    if (field === 'ideaDevelopment' && ideaDevelopment.trim().length < minIdeaDevelopment) return `Describe tu idea con mínimo ${minIdeaDevelopment} caracteres.`;
    if (field === 'consents' && !allConsentsAccepted) return 'Acepta los tres consentimientos (ejemplo: si “App para Bienestar Estudiantil” llega al laboratorio, debemos poder prototiparla citándote).';
    return undefined;
  };

  const validateField = (field: FormErrorKey, formChallenge: any) => {
    const errorMessage = getFieldError(field, formChallenge);
    setFormErrors(prev => {
      const next = { ...prev };
      if (errorMessage) next[field] = errorMessage;
      else delete next[field];
      return next;
    });
    return !errorMessage;
  };

  const validatePublicSubmission = (formChallenge: any): FormErrors => {
    const errors: FormErrors = {};
    (['challenge', 'ideaName', 'ideaDevelopment', 'consents'] as FormErrorKey[]).forEach(field => {
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

  const handleIdeaSubmit = async (targetStatus: 'draft' | 'public', formChallenge: any): Promise<boolean> => {
    if (!profile?._id) {
      const message = {
        tone: 'critical' as FeedbackTone,
        title: 'Perfil no disponible',
        message: 'Necesitamos sincronizar tu sesión nuevamente antes de continuar.',
        persist: true,
      };
      setFormFeedback(message);
      showToast(message);
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
    const description = ideaDevelopment.trim();
    const normalizedTags = () => Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));

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
        await ideaService.saveDraftIdea({
          title: title || undefined,
          description: description || undefined,
          tags: normalizedTags(),
          author: profile._id,
          challengeId: formChallenge?._id,
          isAnonymous: isGuest,
        });
        showToast({
          tone: 'info',
          title: 'Borrador guardado',
          message: 'Guardamos tus avances. Puedes retomarlos cuando quieras.',
        });
        success = true;
      } else {
        await ideaService.createIdea({
          title,
          description,
          tags: normalizedTags(),
          status: targetStatus,
          author: profile._id,
          challengeId: formChallenge._id,
          isAnonymous: isGuest,
        });
        const successMessage: FeedbackMessage = {
          tone: 'success',
          title: 'Idea enviada',
          message: 'Tu propuesta ya está registrada. Te avisaremos si necesitamos más información.',
        };
        setFormFeedback(successMessage);
        showToast(successMessage);
        resetForm();
        success = true;
      }
    } catch (error: any) {
      const interpreted = interpretBackendError(error);
      setFormFeedback(interpreted);
      if (interpreted.persist || interpreted.tone === 'critical') showToast(interpreted);
    } finally {
      setFormSaving(false);
      setSavingAction(null);
    }
    return success;
  };

  return {
    ideaName, setIdeaName,
    ideaDevelopment, setIdeaDevelopment,
    tags, tagInput, setTagInput,
    handleTagAddition, handleTagKeyDown, handleTagRemoval,
    consents, toggleConsent, consentsTouched, setConsentsTouched,
    formErrors, clearFieldError, validateField, validatePublicSubmission,
    formSaving, savingAction, formFeedback, setFormFeedback,
    handleIdeaSubmit, resetForm
  };
};
