import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { Challenge, ChallengeStatus, EvaluationCriterion } from '../../../../types/models';
import axiosInstance from '../../../../api/axiosConfig';

export interface TargetAudience {
  ageRanges: string[];
  participantTypes: string[];
}

export interface ChallengeFormData {
  title: string;
  problemDescription: string;
  companyContext: string;
  participationRules: string;
  startDate: string;
  endDate: string;
  isPrivate: boolean;
  status: ChallengeStatus;
  logoUrl: string;
  evaluationCriteria: EvaluationCriterion[];
  facultyIds: string[];
  targetAudience: TargetAudience;
}

export interface Errors {
  title?: string;
  problemDescription?: string;
  companyContext?: string;
  participationRules?: string;
  startDate?: string;
  endDate?: string;
}

export const WORD_LIMITS = {
  title: { min: 2, max: 15 },
  content: { min: 10, max: 250 },
  rules: { min: 5, max: 250 },
};

/** Cuenta palabras reales en un string */
function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}



const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
};

export const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  { id: 'desirability', name: 'Deseabilidad', description: 'Valor real para personas o negocio', enabled: false, weight: 33, isOptional: false },
  { id: 'feasibility',  name: 'Factibilidad', description: 'Posibilidad real de implementar', enabled: false, weight: 33, isOptional: false },
  { id: 'alignment',    name: 'Alineación',   description: 'Coherencia con el reto y la estrategia', enabled: false, weight: 34, isOptional: false },
  { id: 'viability',    name: 'Viabilidad',    description: 'Sostenibilidad en el tiempo y en recursos', enabled: false, weight: 0, isOptional: true },
  { id: 'speed',        name: 'Rapidez',       description: 'Velocidad estimada de implementación', enabled: false, weight: 0, isOptional: true },
  { id: 'scalability',  name: 'Escalabilidad', description: 'Potencial de crecimiento más allá del piloto', enabled: false, weight: 0, isOptional: true },
];

export const emptyForm: ChallengeFormData = {
  title: '', problemDescription: '', companyContext: '',
  participationRules: '', startDate: '', endDate: '',
  isPrivate: false, status: 'Borrador', logoUrl: '',
  evaluationCriteria: DEFAULT_CRITERIA,
  facultyIds: [],
  targetAudience: { ageRanges: [], participantTypes: [] },
};

export const CUSTOM_NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 -]+$/;
export const MAX_WORDS = 10;

export const compressToWebP = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const formatDate = (d?: string) => {
  if (!d) return '–';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '–';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface UseChallengeFormProps {
  onBack: () => void;
  onSave: (data: ChallengeFormData) => Promise<void>;
  challenge?: Challenge | null;
  readOnlyMode?: boolean;
}

export const useChallengeForm = ({ onBack, onSave, challenge, readOnlyMode = false }: UseChallengeFormProps) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const [form, setForm]               = useState<ChallengeFormData>(emptyForm);
  const [initialForm, setInitialForm] = useState<ChallengeFormData>(emptyForm);
  const [errors, setErrors]           = useState<Errors>({});
  const [saving, setSaving]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName]     = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customError, setCustomError]   = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [logoError, setLogoError]       = useState('');
  const [dbFaculties, setDbFaculties]   = useState<any[]>([]);
  const criteriaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!challenge;
  const hasIdeas   = (challenge?.ideasCount ?? 0) > 0;

  const statusUpper = challenge?.status?.toUpperCase() || '';
  const isClosed = statusUpper === 'CLOSED' || statusUpper === 'FINALIZADO';
  const isDraftOrScheduled =
    statusUpper === 'DRAFT' ||
    statusUpper === 'SCHEDULED' ||
    statusUpper === 'BORRADOR' ||
    statusUpper === 'AGENDADO';
  const isEvaluating = statusUpper === 'EVALUATING' || statusUpper === 'EN_EVALUACION' || statusUpper === 'EN EVALUACIÓN';
  const closeDate = challenge?.endDate || challenge?.submissionsCloseAt;
  const isPastEnd = closeDate ? new Date(closeDate) < new Date() : false;
  const criteriaOnlyMode =
    isEditMode &&
    !isClosed &&
    !isDraftOrScheduled &&
    (hasIdeas || isEvaluating || isPastEnd);

  useEffect(() => {
    const fetchFacs = async () => {
      try {
        const res = await axiosInstance.get('/users/faculties');
        if (res.data) {
          const arr = Array.isArray(res.data.data) ? res.data.data : res.data;
          setDbFaculties(Array.isArray(arr) ? arr : []);
        }
      } catch (err) {
        console.error('Failed to fetch faculties:', err);
      }
    };
    fetchFacs();
  }, []);

  const locked = (field: 'core' | 'flexible' | 'criteria') => {
    if (readOnlyMode) return true;
    if (!isEditMode) return false;
    if (isClosed) return true; // Everything is locked when closed
    const restrictCore = !isDraftOrScheduled && (hasIdeas || isEvaluating || isPastEnd);
    if (field === 'core') return restrictCore;
    if (field === 'flexible') return !isDraftOrScheduled && (isEvaluating || isPastEnd);
    if (field === 'criteria') return false;
    return false;
  };

  useEffect(() => {
    if (criteriaOnlyMode) {
      setCriteriaOpen(true);
    }
  }, [criteriaOnlyMode, challenge?.id]);

  useEffect(() => {
    const toDatetimeLocal = (d?: string | Date) => {
      if (!d) return '';
      const date = new Date(d);
      if (isNaN(date.getTime())) return '';
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    };
    const base = challenge ? {
      title: challenge.title || '',
      problemDescription: challenge.problemDescription || '',
      companyContext: challenge.companyContext || '',
      participationRules: challenge.participationRules || '',
      startDate: toDatetimeLocal(challenge.startDate || challenge.submissionsOpenAt),
      endDate: toDatetimeLocal(challenge.endDate || challenge.submissionsCloseAt),
      isPrivate: challenge.isPrivate || false,
      status: challenge.status || 'Borrador',
      logoUrl: challenge.logoUrl || '',
      evaluationCriteria: (challenge.evaluationCriteria && challenge.evaluationCriteria.length > 0)
        ? DEFAULT_CRITERIA.map(dc => {
            const saved = challenge.evaluationCriteria!.find((c: any) => c.name === dc.name || c.id === dc.id);
            if (saved) return { ...dc, ...saved, enabled: true };
            return { ...dc, enabled: false };
          }).concat(
            challenge.evaluationCriteria!.filter((c: any) => !DEFAULT_CRITERIA.some(dc => dc.name === c.name || dc.id === c.id))
          )
        : DEFAULT_CRITERIA,
      facultyIds: challenge.challengeFaculties 
        ? challenge.challengeFaculties.map((cf: any) => cf.facultyId)
        : challenge.faculties 
          ? challenge.faculties.map((f: any) => f.id) 
          : (challenge.facultyId ? [String(challenge.facultyId)] : []),
      targetAudience: (challenge as any).targetAudience || { ageRanges: [], participantTypes: [] },
    } as ChallengeFormData : emptyForm;

    setForm(base);
    setInitialForm(JSON.parse(JSON.stringify(base)));
    setErrors({});
  }, [challenge]);

  useEffect(() => {
    document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(t => {
      t.style.height = 'auto';
      t.style.height = `${t.scrollHeight}px`;
    });
  }, [form.problemDescription, form.companyContext, form.participationRules]);

  const updateField = useCallback(<K extends keyof ChallengeFormData>(key: K, val: ChallengeFormData[K]) => {
    if (readOnlyMode) return;
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }, [readOnlyMode]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnlyMode) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLogoError('Formato no soportado. Por favor sube una imagen JPG, PNG o WEBP.');
      return;
    }

    setLogoError('');
    try {
      const webp = await compressToWebP(file);
      updateField('logoUrl', webp);
    } catch {
      setLogoError('Hubo un error al procesar la imagen.');
    }
  };

  const updateCriterion = (id: string, patch: Partial<EvaluationCriterion>) => {
    if (readOnlyMode) return;
    setForm(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.map(c => c.id === id ? { ...c, ...patch } : c),
    }));
  };

  const removeCriterion = (id: string) => {
    if (readOnlyMode) return;
    setForm(prev => ({ ...prev, evaluationCriteria: prev.evaluationCriteria.filter(c => c.id !== id) }));
  };

  const validateCustomName = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return 'Escribe un nombre';
    if (!CUSTOM_NAME_RE.test(trimmed)) return 'Solo letras, números y espacios';
    if ((trimmed.match(/\b\w+\b/g) || []).length > MAX_WORDS) return `Máximo ${MAX_WORDS} palabras`;
    if (/(.)\1{2,}/.test(trimmed)) return 'No puedes repetir un carácter más de 2 veces seguidas';
    if (form.evaluationCriteria.some(c => c.name.toLowerCase() === trimmed.toLowerCase()))
      return 'Ese criterio ya existe';
    return '';
  };

  const addCustomCriterion = () => {
    if (readOnlyMode) return;
    const err = validateCustomName(customName);
    if (err) { setCustomError(err); return; }
    setForm(prev => ({
      ...prev,
      evaluationCriteria: [...prev.evaluationCriteria, {
        id: `custom-${Date.now()}`, name: customName.trim(), description: customDescription.trim(),
        enabled: true, weight: 0, isCustom: true,
      }],
    }));
    setCustomName(''); setCustomDescription(''); setCustomError(''); setAddingCustom(false);
  };

  const totalWeight = form.evaluationCriteria
    .filter(c => c.enabled)
    .reduce((s, c) => s + (Number(c.weight) || 0), 0);

  const validate = (forDraft: boolean): boolean => {
    const errs: Errors = {};

    // ─ Título: obligatorio siempre, 2–15 palabras (skip if criteriaOnlyMode) ─
    if (!criteriaOnlyMode) {
      const titleWords = countWords(form.title);
      if (!form.title.trim()) {
        errs.title = 'El título es obligatorio';
      } else if (titleWords < WORD_LIMITS.title.min || titleWords > WORD_LIMITS.title.max) {
        errs.title = `El título debe tener entre ${WORD_LIMITS.title.min} y ${WORD_LIMITS.title.max} palabras (llevas ${titleWords})`;
      }
    }

    // ─ Los demás campos solo se validan al publicar (y si no estamos en criteriaOnlyMode) ─
    if (!forDraft && !criteriaOnlyMode) {
      if ((form.startDate && !form.endDate) || (!form.startDate && form.endDate)) {
        if (!form.startDate) errs.startDate = 'Debes ingresar ambas fechas o dejarlas vacías para activación inmediata';
        if (!form.endDate) errs.endDate = 'Debes ingresar ambas fechas o dejarlas vacías para activación inmediata';
      } else if (form.startDate && form.endDate) {
        const startD = new Date(form.startDate);
        const now = new Date();
        const startChanged = !initialForm.startDate || new Date(form.startDate).getTime() !== new Date(initialForm.startDate).getTime();
        if (startChanged && startD < new Date(now.getTime() - 5 * 60 * 1000)) {
          errs.startDate = 'La fecha de inicio no puede ser anterior a la fecha actual';
        }
        if (new Date(form.endDate) <= startD) {
          errs.endDate = 'La fecha fin debe ser posterior al inicio';
        }
      }

      const descWords = countWords(form.problemDescription);
      if (!form.problemDescription.trim()) {
        errs.problemDescription = 'La descripción del problema es obligatoria';
      } else if (descWords < WORD_LIMITS.content.min || descWords > WORD_LIMITS.content.max) {
        errs.problemDescription = `La descripción debe tener entre ${WORD_LIMITS.content.min} y ${WORD_LIMITS.content.max} palabras (llevas ${descWords})`;
      }

      const ctxWords = countWords(form.companyContext);
      if (!form.companyContext.trim()) {
        errs.companyContext = 'El contexto de la organización es obligatorio';
      } else if (ctxWords < WORD_LIMITS.content.min || ctxWords > WORD_LIMITS.content.max) {
        errs.companyContext = `El contexto debe tener entre ${WORD_LIMITS.content.min} y ${WORD_LIMITS.content.max} palabras (llevas ${ctxWords})`;
      }

      const rulesWords = countWords(form.participationRules);
      if (!form.participationRules.trim()) {
        errs.participationRules = 'Las reglas de participación son obligatorias';
      } else if (rulesWords < WORD_LIMITS.rules.min || rulesWords > WORD_LIMITS.rules.max) {
        errs.participationRules = `Las reglas deben tener entre ${WORD_LIMITS.rules.min} y ${WORD_LIMITS.rules.max} palabras (llevas ${rulesWords})`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBack = () => {
    if (!deepEqual(form, initialForm)) {
      setShowConfirm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onBack();
  };

  const handleSave = async (status: ChallengeStatus) => {
    if (readOnlyMode) {
      toast.info('Estás en modo lectura ahora. No puedes guardar cambios.');
      return;
    }
    const forDraft = status === 'Borrador' || status === 'DRAFT';
    if (!validate(forDraft)) return;

    const enabledCriteria = form.evaluationCriteria.filter(c => c.enabled);
    if (enabledCriteria.length > 0) {
      if (enabledCriteria.some(c => c.weight === 0)) {
        toast.error('Criterio sin valor', {
          description: 'No puedes enviar un criterio de evaluación con 0% de peso. Asígnale un valor o desmárcalo.',
        });
        return;
      }
      if (totalWeight !== 100) {
        toast.error('Pesos inválidos', {
          description: `El peso total de los criterios debe sumar exactamente 100% (actual: ${totalWeight}%).`,
        });
        return;
      }
    }

    const criteriaChanged =
      JSON.stringify(form.evaluationCriteria) !== JSON.stringify(initialForm.evaluationCriteria);
    if (criteriaOnlyMode && criteriaChanged) {
      toast.info('Al guardar, las evaluaciones de los jueces se reiniciarán con los nuevos criterios.');
    }

    setSaving(true);
    try {
      let payload: any = { ...form, status };

      if (criteriaOnlyMode) {
        payload = {
          status,
          evaluationCriteria: form.evaluationCriteria,
          facultyIds: form.facultyIds,
        };
      } else {
        if (payload.startDate && payload.startDate.trim() !== '') {
          const d = new Date(payload.startDate);
          if (!isNaN(d.getTime())) {
            payload.startDate = d.toISOString();
          } else {
            payload.startDate = null;
          }
        } else {
          payload.startDate = null;
        }
        if (payload.endDate && payload.endDate.trim() !== '') {
          const d = new Date(payload.endDate);
          if (!isNaN(d.getTime())) {
            payload.endDate = d.toISOString();
          } else {
            payload.endDate = null;
          }
        } else {
          payload.endDate = null;
        }
      }

      await onSave(payload);
    }
    finally { setSaving(false); }
  };

  const toggleCriteria = () => {
    if (readOnlyMode) return;
    const next = !criteriaOpen;
    setCriteriaOpen(next);
    if (next) setTimeout(() => criteriaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return {
    form,
    errors,
    saving,
    showConfirm,
    setShowConfirm,
    criteriaOpen,
    addingCustom,
    setAddingCustom,
    customName, setCustomName,
    customDescription, setCustomDescription,
    customError, setCustomError,
    lightboxOpen,
    setLightboxOpen,
    logoError,
    dbFaculties,
    criteriaRef,
    fileInputRef,
    isEditMode,
    hasIdeas,
    criteriaOnlyMode,
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
  };
};
