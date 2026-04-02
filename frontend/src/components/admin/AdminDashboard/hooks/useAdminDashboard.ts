import { useState } from 'react';
import { authService } from '../../../../services/auth.service';
import { challengeService } from '../../../../services/challenge.service';

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab ] = useState('challenges');
  const [showForm, setShowForm] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  const defaultStart = new Date().toISOString().split('T')[0];
  const defaultEnd = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: defaultStart,
    endDate: defaultEnd,
    isPrivate: false,
    token: '',
    facultyId: 1
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
    const link = `pista8.com/challenges/private/${formData.token}`;
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

  const handleSaveChallenge = async (status: 'Borrador' | 'Activo') => {
    setSaving(true);
    try {
      const payload: any = {
        title: formData.title,
        problemDescription: formData.description || undefined,
        startDate: formData.startDate,
        isPrivate: formData.isPrivate,
        facultyId: formData.facultyId,
        status: status
      };
      if (formData.endDate) {
        payload.endDate = formData.endDate;
      }
      await challengeService.createChallenge(payload);
      if (status === 'Activo') {
        setShowForm(false);
      }
      return true;
    } catch (error) {
      console.error(error);
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
    saving
  };
};
