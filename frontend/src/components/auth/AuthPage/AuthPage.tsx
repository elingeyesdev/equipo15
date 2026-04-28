import React, { useState } from 'react';
import { useAuthForm } from './hooks/useAuthForm';
import * as S from './styles/AuthStyles';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

const AuthPage = () => {
  const {
    isLogin, setIsLogin, formData, setFormData, loading, errorVisible, handleSubmit, handleGoogleLogin,
    passwordChecks, isFormValid, isResetMode, setIsResetMode, handleResetPassword
  } = useAuthForm();

  const [showNoAccountModal, setShowNoAccountModal] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleResetPassword(formData.email);
    if (success) {
      toast.success('Link de recuperación enviado a tu correo institucional');
      setIsResetMode(false);
    }
  };

  const handleGoogleWithCheck = async () => {
    try {
      await handleGoogleLogin();
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        setShowNoAccountModal(true);
      }
    }
  };

  const goToRegister = () => {
    setShowNoAccountModal(false);
    setIsLogin(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <S.StyledWrapper>
      <S.Card>
        <S.LogoWrap>
          <S.LogoSvg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#485054" letterSpacing="-2">PIST</text>
            <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
            <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#485054">8</text>
          </S.LogoSvg>
        </S.LogoWrap>

        <S.SepLine />

        {errorVisible && (
          <S.ErrorBanner>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errorVisible}
          </S.ErrorBanner>
        )}

        <AnimatePresence mode="wait">
          {isResetMode ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <S.Form onSubmit={onResetSubmit}>
                <S.FieldWrap>
                  <S.FieldLabel>Correo institucional</S.FieldLabel>
                  <S.FieldInput
                    type="email"
                    placeholder="tu@est.univalle.edu"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </S.FieldWrap>

                <S.BtnMain type="submit" disabled={loading}>
                  {loading ? <S.Spinner /> : 'Enviar link de recuperación'}
                </S.BtnMain>

                <S.SwitchRow>
                  <S.SwitchBtn type="button" onClick={() => setIsResetMode(false)}>
                    Volver al inicio de sesión
                  </S.SwitchBtn>
                </S.SwitchRow>
              </S.Form>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <S.Tabs>
                <S.Tab active={isLogin} onClick={() => setIsLogin(true)}>Iniciar sesión</S.Tab>
                <S.Tab active={!isLogin} onClick={() => setIsLogin(false)}>Registrarse</S.Tab>
              </S.Tabs>

              <S.Form onSubmit={handleSubmit}>
                {!isLogin && (
                  <S.FieldWrap isName>
                    <S.FieldLabel>Nombre completo</S.FieldLabel>
                    <S.FieldInput
                      type="text"
                      placeholder="Tu nombre"
                      required={!isLogin}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </S.FieldWrap>
                )}

                <S.FieldWrap>
                  <S.FieldLabel>Correo electrónico</S.FieldLabel>
                  <S.FieldInput
                    type="email"
                    placeholder="tu@correo.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </S.FieldWrap>

                <S.FieldWrap>
                  <S.FieldLabel>Contraseña</S.FieldLabel>
                  <S.InputGroup>
                    <S.FieldInput
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <S.EyeBtn type="button" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </S.EyeBtn>
                  </S.InputGroup>
                </S.FieldWrap>

                {!isLogin && (
                  <S.ValidationList>
                    <S.ValidationItem isValid={passwordChecks.length}>
                      {passwordChecks.length ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      8+ caracteres
                    </S.ValidationItem>
                    <S.ValidationItem isValid={passwordChecks.uppercase}>
                      {passwordChecks.uppercase ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      1 mayúscula
                    </S.ValidationItem>
                    <S.ValidationItem isValid={passwordChecks.symbol}>
                      {passwordChecks.symbol ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      1 símbolo
                    </S.ValidationItem>
                  </S.ValidationList>
                )}

                {isLogin && (
                  <S.ForgotRow>
                    <S.ForgotLink onClick={() => setIsResetMode(true)} style={{ cursor: 'pointer' }}>
                      ¿Olvidaste tu contraseña?
                    </S.ForgotLink>
                  </S.ForgotRow>
                )}

                <S.BtnMain type="submit" disabled={loading || !isFormValid}>
                  {loading ? <S.Spinner /> : (isLogin ? 'Entrar' : 'Registrarme')}
                </S.BtnMain>
              </S.Form>

              {isLogin && (
                <>
                  <S.OrRow>
                    <S.OrLine />
                    <S.OrText>o continúa con</S.OrText>
                    <S.OrLine />
                  </S.OrRow>

                  <S.BtnGoogle type="button" onClick={handleGoogleWithCheck} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    Continuar con Google
                  </S.BtnGoogle>
                </>
              )}

              <S.SwitchRow>
                <S.SwitchText>
                  {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                </S.SwitchText>
                <S.SwitchBtn type="button" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </S.SwitchBtn>
              </S.SwitchRow>
            </motion.div>
          )}
        </AnimatePresence>
      </S.Card>

      <AnimatePresence>
        {showNoAccountModal && (
          <S.ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <S.ModalCard
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div style={{ background: '#FFF4E5', padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FE410A" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <S.ModalTitle>¡Casi listo!</S.ModalTitle>
              <S.ModalText>
                No encontramos una cuenta vinculada a este Google. Regístrate primero con tu correo institucional para despegar.
              </S.ModalText>
              <S.ModalBtnRow>
                <S.BtnMain onClick={goToRegister}>Ir a Registro</S.BtnMain>
                <S.SwitchBtn onClick={() => setShowNoAccountModal(false)}>Cerrar</S.SwitchBtn>
              </S.ModalBtnRow>
            </S.ModalCard>
          </S.ModalOverlay>
        )}
      </AnimatePresence>
    </S.StyledWrapper>
  );
};

export default AuthPage;