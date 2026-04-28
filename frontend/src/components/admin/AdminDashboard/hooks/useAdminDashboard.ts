import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../../services/auth.service';
import { challengeService } from '../../../../services/challenge.service';
import type { Challenge, ChallengeStatus } from '../../../../types/models';
import { 
  Validator, RequiredValidation, MaxLengthValidation, MinLengthValidation, 
  NoRepetitiveCharactersValidation, DateRangeValidation,
  NoNumbersValidation, NoExcessiveSymbolsValidation
} from '../../../../components/form/ValidationStrategies';

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [showForm, setShowForm] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const response = await challengeService.getPublicChallenges();
      if (response.success) {
        setChallenges(response.data.data);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? (error as any).response?.data?.message || error.message : 'Hubo un problema al obtener los retos.';
      toast.error(message);
    } finally {
      setLoadingChallenges(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'challenges') {
      fetchChallenges();
    }
  }, [activeTab]);

  const defaultStart = new Date().toISOString().split('T')[0];
  const defaultEnd = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyContext: '',
    participationRules: '',
    startDate: defaultStart,
    endDate: defaultEnd,
    isPrivate: false,
    token: '',
    facultyId: 0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const errors: Record<string, string | null> = {};



    const titleValidator = new Validator([
      new RequiredValidation(),
      new MinLengthValidation(10),
      new MaxLengthValidation(100),
      new NoRepetitiveCharactersValidation(5),
      new NoNumbersValidation(),
      new NoExcessiveSymbolsValidation(0.3)
    ]);
    
    const descValidator = new Validator([
      new RequiredValidation(),
      new MinLengthValidation(200),
      new NoRepetitiveCharactersValidation(5),
      new NoNumbersValidation(),
      new NoExcessiveSymbolsValidation(0.3)
    ]);

    const textValidatorNoNumbers = new Validator([
      new RequiredValidation(),
      new NoRepetitiveCharactersValidation(5),
      new NoNumbersValidation(),
      new NoExcessiveSymbolsValidation(0.3)
    ]);

    const rulesValidator = new Validator([
      new RequiredValidation(),
      new NoRepetitiveCharactersValidation(5),
      new NoExcessiveSymbolsValidation(0.3)
    ]);

    errors.title = titleValidator.validate(formData.title);
    errors.description = descValidator.validate(formData.description);
    errors.companyContext = textValidatorNoNumbers.validate(formData.companyContext);
    errors.participationRules = rulesValidator.validate(formData.participationRules);

    const dateValidator = new Validator([
      new DateRangeValidation(7)
    ]);
    errors.dates = dateValidator.validate({ start: formData.startDate, end: formData.endDate });

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const startD = new Date(formData.startDate);
    startD.setHours(0, 0, 0, 0);
    if (startD < todayDate) {
      errors.startDate = 'No puede ser una fecha pasada';
    } else {
      errors.startDate = null;
    }

    setFormErrors(errors);
  }, [formData]);

  const togglePrivacy = () => {
    const nextPrivate = !formData.isPrivate;
    setFormData({
      ...formData,
      isPrivate: nextPrivate,
      token: nextPrivate ? crypto.randomUUID() : ''
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    setFormData({
      ...formData,
      startDate: start,
      endDate: end.toISOString().split('T')[0]
    });
  };

  const copyToClipboard = () => {
    const link = `${window.location.origin}/dashboard/reto/${formData.token}`;
    navigator.clipboard.writeText(link);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/auth';
  };

  const isFormValid = !Object.values(formErrors).some(err => err !== null) && 
                      formData.title.trim() !== '' && 
                      formData.description.trim() !== '' && 
                      formData.endDate !== '';

  const [saving, setSaving] = useState(false);

  const handleSaveChallenge = async (status: ChallengeStatus) => {
    if (status === 'Activo') {
      setSubmitted(true);
      if (!isFormValid) {
        toast.error('Corrija los errores del formulario antes de publicar.');
        return false;
      }
    }

    setSaving(true);
    try {
      const payload: Partial<Challenge> & { authorId?: string; id?: string; publicationDate?: string } = {
        title: formData.title,
        problemDescription: formData.description || undefined,
        companyContext: formData.companyContext || undefined,
        participationRules: formData.participationRules || undefined,
        startDate: formData.startDate,
        publicationDate: status === 'Activo' ? new Date().toISOString() : undefined,
        isPrivate: formData.isPrivate,
        facultyId: formData.facultyId === 0 ? undefined : formData.facultyId,
        status: status
      };

      if (formData.isPrivate && formData.token) {
        payload.id = formData.token;
      }
      if (formData.endDate) {
        payload.endDate = formData.endDate;
      }
      
      await challengeService.createChallenge(payload as any);
      if (status === 'Activo') {
        setShowForm(false);
        setSubmitted(false);
        setFormData({
          title: '',
          description: '',
          companyContext: '',
          participationRules: '',
          startDate: defaultStart,
          endDate: defaultEnd,
          isPrivate: false,
          token: '',
          facultyId: 0
        });
      }
      
      toast.success(status === 'Activo' ? '¡Reto publicado con éxito!' : 'Borrador guardado correctamente.');

      fetchChallenges();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? (error as any).response?.data?.message || error.message : 'Hubo un problema al guardar el reto.';
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    showForm,
    setShowForm,
    isPreview,
    setIsPreview,
    copyStatus,
    formData,
    setFormData,
    togglePrivacy,
    handleStartDateChange,
    copyToClipboard,
    handleLogout,
    isFormValid,
    formErrors,
    submitted,
    setSubmitted,
    handleSaveChallenge,
    saving,
    challenges,
    loadingChallenges,
    fetchChallenges
  };
};
