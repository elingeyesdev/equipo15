import { useState } from 'react';
import { authService } from '../../../../services/auth.service';

export const useAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState<string | null>(null);

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
      console.error(error);
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
      console.error(error);
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
    handleGoogleLogin
  };
};
