import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../../services/auth.service';
import { challengeService } from '../../../../services/challenge.service';
import type { Challenge, ChallengeStatus } from '../../../../types/models';

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [showForm, setShowForm] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
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

  const isFormValid = formData.title.trim() !== '' && formData.description.trim() !== '' && formData.endDate !== '';

  const [saving, setSaving] = useState(false);

  const handleSaveChallenge = async (status: ChallengeStatus) => {
    setSaving(true);
    try {
      const payload: Partial<Challenge> & { authorId?: string; id?: string } = {
        title: formData.title,
        problemDescription: formData.description || undefined,
        companyContext: formData.companyContext || undefined,
        participationRules: formData.participationRules || undefined,
        startDate: formData.startDate,
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
    handleSaveChallenge,
    saving,
    challenges,
    loadingChallenges,
    fetchChallenges
  };
};
