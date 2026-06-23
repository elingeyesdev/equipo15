import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../../services/auth.service';
import { useAuth } from '../../../../context/AuthContext';

export const useAuthForm = () => {
  const { user, userProfile, refetchProfile, setSuppressAuth, impersonationSession, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const isGoogleCompletingProfile = user !== null && userProfile === null && !impersonationSession && !authLoading && user.providerData.some(p => p.providerId === 'google.com');
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<any>(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const showError = useCallback((msg: string) => { toast.error(msg); }, []);

  const showSuccess = useCallback((msg: string) => { toast.success(msg); }, []);







  useEffect(() => {
    if (user && !userProfile) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: prev.name || user.displayName || '',
      }));
    }
  }, [user, userProfile]);

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    symbol: /[\W_]/.test(formData.password)
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.(com|edu|org|net|bo|info|biz|co|mx)$/i.test(email);
  };

  const validateName = (name: string) => {
    if (!name) return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
  };

  const isFormValid = isLogin
    ? validateEmail(formData.email) && formData.password.length > 0
    : validateName(formData.name) && validateEmail(formData.email) && isPasswordValid && formData.phone.replace(/\D/g, '').length === 8;

  const getNameHint = (): string | null => {
    if (isLogin || !formData.name) return null;
    if (/\d/.test(formData.name)) return 'El nombre no puede contener números.';
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(formData.name)) return 'El nombre solo puede contener letras y espacios.';
    return null;
  };

  const getEmailHint = (): string | null => {
    if (!formData.email || formData.email.length < 3) return null;
    if (isLogin) return null;
    if (!formData.email.includes('@')) return 'Falta el símbolo @ en el correo.';
    if (!validateEmail(formData.email)) return 'Ingresa un correo válido (ej: tu@est.univalle.edu).';
    return null;
  };

  const fieldHints = {
    name: getNameHint(),
    email: getEmailHint()
  };

  const getFriendlyError = (error: any): string => {
    const code = error?.code || error?.response?.data?.code || '';
    switch (code) {
      case 'auth/email-already-in-use': return 'Este correo ya está registrado. Intenta iniciar sesión.';
      case 'auth/invalid-credential': return 'Correo o contraseña incorrectos.';
      case 'auth/weak-password': return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/invalid-email': return 'El formato del correo no es válido.';
      case 'auth/user-not-found': return 'No existe una cuenta con este correo.';
      case 'auth/popup-closed-by-user': return 'El login de Google fue cancelado.';
      case 'auth/network-request-failed': return 'Error de red. Verifica tu conexión.';
      case 'auth/account-exists-with-different-credential': return 'Ya existe una cuenta registrada con este correo en la plataforma.';
      case '403':
      case 'ERR_BAD_REQUEST':
        return (
          error?.response?.data?.message ||
          (error?.response?.status === 403
            ? 'Tu correo no pertenece a un dominio autorizado.'
            : 'No fue posible autorizar tu acceso.')
        );
      default: return error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!validateEmail(email)) {
      showError('Por favor ingresa un correo institucional válido.');
      return false;
    }
    setLoading(true);
    try {
      await authService.sendPasswordReset(email);
      return true;
    } catch (error: any) {
      showError(getFriendlyError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      const rawPhone = formData.phone.replace(/\D/g, '');
      if (rawPhone.length !== 8) {
        setPhoneError(`Tu número debe tener 8 dígitos. Te faltan ${8 - rawPhone.length} números.`);
        return;
      }
    }
    setLoading(true);
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        setSuppressAuth(true);
        try {
          const fullPhone = formData.phone ? `+591${formData.phone.replace(/\D/g, '')}` : undefined;
          await authService.register(formData.email, formData.password, formData.name, fullPhone);
        } finally {
          setSuppressAuth(false);
        }
        showSuccess('Cuenta creada correctamente. Inicia sesión para continuar.');
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '', phone: '' });
        setPhoneError(null);
      }
    } catch (error: any) {
      showError(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setSuppressAuth(true);
    try {
      await authService.loginWithGoogle();
      setSuppressAuth(false);
    } catch (error: any) {
      const code = error?.code || error?.response?.data?.code || '';
      if (code === 'auth/account-exists-with-different-credential') {
        const { GoogleAuthProvider } = await import('firebase/auth');
        const credential = GoogleAuthProvider.credentialFromError(error);
        setPendingGoogleCredential(credential);
        setGoogleEmail(error.customData?.email || '');
        setIsLinkingAccount(true);
      } else if (error.message === 'USER_NOT_FOUND') {
        setSuppressAuth(false);
      } else {
        setSuppressAuth(false);
        showError(getFriendlyError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleRegistration = async () => {
    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 8) {
      setPhoneError(`Tu número debe tener 8 dígitos. Te faltan ${8 - rawPhone.length} números.`);
      return;
    }
    if (!isPasswordValid) {
      showError('Por favor asegúrate de cumplir con los requisitos de la contraseña.');
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `+591${rawPhone}`;
      await authService.completeGoogleRegistration(formData.name, fullPhone, formData.password);
      showSuccess('Registro completado correctamente.');
      await refetchProfile();
      setSuppressAuth(false);
    } catch (error: any) {
      showError(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogleAccount = async () => {
    if (!formData.password) {
      showError('Por favor ingresa tu contraseña.');
      return;
    }
    setLoading(true);
    try {
      await authService.linkGoogleAccountWithPassword(googleEmail, formData.password, pendingGoogleCredential);
      showSuccess('Cuenta vinculada con éxito. Sesión iniciada.');
      await refetchProfile();
      setIsLinkingAccount(false);
      setPendingGoogleCredential(null);
      setSuppressAuth(false);
    } catch (error: any) {
      showError(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGoogleFlow = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setIsLinkingAccount(false);
      setPendingGoogleCredential(null);
      setSuppressAuth(false);
      setFormData({ email: '', password: '', name: '', phone: '' });
      setPhoneError(null);
    } catch (error: any) {
      showError(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSetIsLogin = useCallback((value: boolean) => {
    setIsLogin(value);
    setFormData({ email: '', password: '', name: '', phone: '' });
    setPhoneError(null);
  }, []);

  return {
    isLogin,
    setIsLogin: handleSetIsLogin,
    formData,
    setFormData,
    loading,
    handleSubmit,
    handleGoogleLogin,
    passwordChecks,
    isFormValid,
    fieldHints,
    validateEmail,
    validateName,
    isResetMode,
    setIsResetMode,
    handleResetPassword,
    phoneError,
    isGoogleCompletingProfile,
    isLinkingAccount,
    googleEmail,
    handleCompleteGoogleRegistration,
    handleLinkGoogleAccount,
    handleCancelGoogleFlow,
    userProfile,
  };
};
