import { useState, useRef, useEffect, useCallback } from 'react';
import { authService } from '../../../../services/auth.service';
import { useAuth } from '../../../../context/AuthContext';

export const useAuthForm = () => {
  const { setSuppressAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorVisible(msg);
    errorTimerRef.current = setTimeout(() => setErrorVisible(null), 5000);
  }, []);

  const showSuccess = useCallback((msg: string) => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSuccessVisible(msg);
    successTimerRef.current = setTimeout(() => setSuccessVisible(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorVisible(null);
  }, []);

  const clearSuccess = useCallback(() => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setSuccessVisible(null);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

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
    : validateName(formData.name) && validateEmail(formData.email) && isPasswordValid;

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
      default: return error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!validateEmail(email)) {
      showError('Por favor ingresa un correo institucional válido.');
      return false;
    }
    setLoading(true);
    clearError();
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
    setLoading(true);
    clearError();
    clearSuccess();
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        setSuppressAuth(true);
        try {
          await authService.register(formData.email, formData.password, formData.name);
        } finally {
          setSuppressAuth(false);
        }
        showSuccess('Cuenta creada correctamente. Inicia sesión para continuar.');
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '' });
      }
    } catch (error: any) {
      showError(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    clearError();
    clearSuccess();
    try {
      await authService.loginWithGoogle();
    } catch (error: any) {
      showError(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSetIsLogin = useCallback((value: boolean) => {
    setIsLogin(value);
    setFormData({ email: '', password: '', name: '' });
    clearError();
    clearSuccess();
  }, [clearError, clearSuccess]);

  return {
    isLogin,
    setIsLogin: handleSetIsLogin,
    formData,
    setFormData,
    loading,
    errorVisible,
    successVisible,
    clearError,
    clearSuccess,
    handleSubmit,
    handleGoogleLogin,
    passwordChecks,
    isFormValid,
    fieldHints,
    validateEmail,
    validateName,
    isResetMode,
    setIsResetMode,
    handleResetPassword
  };
};
