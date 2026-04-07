import { useState } from 'react';
import { authService } from '../../../../services/auth.service';

export const useAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState<string | null>(null);

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

  const getFriendlyError = (error: any): string => {
    const code = error?.code || error?.response?.data?.code || '';
    switch (code) {
      case 'auth/email-already-in-use': return 'Este correo ya está registrado. Intenta iniciar sesión.';
      case 'auth/invalid-credential': return 'Correo o contraseña incorrectos.';
      case 'auth/weak-password': return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/invalid-email': return 'El formato del correo no es válido.';
      case 'auth/user-not-found': return 'No existe una cuenta con este correo.';
      case 'auth/popup-closed-by-user': return 'El login de Google fue cancelado.';
      default: return error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorVisible(null);
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.register(formData.email, formData.password, formData.name);
      }
    } catch (error: any) {
      setErrorVisible(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorVisible(null);
    try {
      await authService.loginWithGoogle();
    } catch (error: any) {
      setErrorVisible(getFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  return {
    isLogin,
    setIsLogin,
    formData,
    setFormData,
    loading,
    errorVisible,
    handleSubmit,
    handleGoogleLogin,
    passwordChecks,
    isFormValid,
    validateEmail,
    validateName
  };
};
