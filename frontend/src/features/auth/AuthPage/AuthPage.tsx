import React, { useState } from 'react';
import { useAuthForm } from './hooks/useAuthForm';
import * as S from './styles/AuthStyles';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import Pista8Logo from '../../../components/icons/Pista8Logo';


const AuthPage = () => {
  const {
    isLogin, setIsLogin, formData, setFormData, loading,
    handleSubmit, handleGoogleLogin,
    passwordChecks, isFormValid, fieldHints, isResetMode, setIsResetMode, handleResetPassword,
    isGoogleCompletingProfile, isLinkingAccount, googleEmail,
    handleCompleteGoogleRegistration, handleLinkGoogleAccount, handleCancelGoogleFlow,
    userProfile
  } = useAuthForm();

  const [showPass, setShowPass] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const onResetSubmitLocal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email) return;
    const success = await handleResetPassword(formData.email);
    if (success) {
      toast.success('Link de recuperación enviado a tu correo institucional');
      setIsResetMode(false);
    }
  };

  const onLocalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormValid) handleSubmit(e);
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
      <AnimatePresence>
      </AnimatePresence>

      <S.Card>
        <S.LogoWrap>
          <Pista8Logo width={180} />
        </S.LogoWrap>

        <S.SepLine />

        <AnimatePresence mode="wait">
          {isResetMode ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <S.Form noValidate onSubmit={onResetSubmitLocal}>
                <S.FieldWrap>
                  <S.FieldLabel>Correo institucional</S.FieldLabel>
                  <S.FieldInput
                    type="email"
                    placeholder="tu@est.univalle.edu"
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
          ) : !!sessionStorage.getItem('pista8_impersonation') && userProfile === null ? (
            <motion.div
              key="impersonation-error"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1f22', marginBottom: 12, textAlign: 'center' }}>Perfil Incompleto</h3>
              <p style={{ fontSize: 13, color: '#5f6368', marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
                El usuario que intentas impersonar no ha finalizado su registro institucional, por lo que su perfil no puede ser cargado en modo espejo.
              </p>
              <S.BtnMain type="button" onClick={() => {
                sessionStorage.removeItem('pista8_impersonation');
                window.location.href = '/admin';
              }}>
                Cerrar Modo Espejo
              </S.BtnMain>
            </motion.div>
          ) : isGoogleCompletingProfile ? (
            <motion.div
              key="google-complete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1f22', marginBottom: 12, textAlign: 'center' }}>Completa tu Perfil</h3>
              <p style={{ fontSize: 13, color: '#5f6368', marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
                Estás registrado con Google, pero necesitamos estos datos adicionales para tu cuenta institucional.
              </p>

              <S.Form noValidate onSubmit={(e) => { e.preventDefault(); handleCompleteGoogleRegistration(); }}>
                <S.FieldWrap>
                  <S.FieldLabel>Correo electrónico</S.FieldLabel>
                  <S.FieldInput
                    type="email"
                    value={formData.email}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </S.FieldWrap>

                <S.FieldWrap>
                  <S.FieldLabel>Nombre completo</S.FieldLabel>
                  <S.FieldInput
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {fieldHints.name && <S.FieldHint>{fieldHints.name}</S.FieldHint>}
                </S.FieldWrap>

                <S.FieldWrap>
                  <S.FieldLabel>Teléfono</S.FieldLabel>
                  <S.PhoneInputWrapReg>
                    <S.PhonePrefixReg>+591</S.PhonePrefixReg>
                    <S.FieldInput
                      type="tel"
                      placeholder="Ej: 71234567"
                      value={formData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        if (digits.length <= 8) {
                          setFormData({ ...formData, phone: digits });
                        }
                      }}
                      maxLength={8}
                    />
                  </S.PhoneInputWrapReg>
                  {formData.phone.length > 0 && formData.phone.length !== 8 && (
                    <S.FieldHint>
                      Tu número debe tener 8 dígitos. Te faltan {8 - formData.phone.length} números.
                    </S.FieldHint>
                  )}
                </S.FieldWrap>

                <S.FieldWrap>
                  <S.FieldLabel>Establecer Contraseña (para accesos tradicionales futuros)</S.FieldLabel>
                  <S.InputGroup>
                    <S.FieldInput
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <S.EyeBtn type="button" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </S.EyeBtn>
                  </S.InputGroup>
                </S.FieldWrap>

                {passwordFocused && (
                  <S.ValidationList>
                    <S.ValidationItem $isValid={passwordChecks.length}>
                      {passwordChecks.length ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      8+ caracteres
                    </S.ValidationItem>
                    <S.ValidationItem $isValid={passwordChecks.uppercase}>
                      {passwordChecks.uppercase ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      1 mayúscula
                    </S.ValidationItem>
                    <S.ValidationItem $isValid={passwordChecks.symbol}>
                      {passwordChecks.symbol ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      1 símbolo
                    </S.ValidationItem>
                  </S.ValidationList>
                )}

                <S.BtnMain type="submit" disabled={loading || !formData.name || formData.phone.length !== 8 || !Object.values(passwordChecks).every(Boolean)}>
                  {loading ? <S.Spinner /> : 'Completar Registro'}
                </S.BtnMain>

                <S.SwitchRow>
                  <S.SwitchBtn type="button" onClick={handleCancelGoogleFlow}>
                    Cancelar y salir
                  </S.SwitchBtn>
                </S.SwitchRow>
              </S.Form>
            </motion.div>
          ) : isLinkingAccount ? (
            <motion.div
              key="google-link"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1f22', marginBottom: 12, textAlign: 'center' }}>Vincular tu cuenta</h3>
              <p style={{ fontSize: 13, color: '#5f6368', marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
                Ya existe una cuenta para el correo <strong>{googleEmail}</strong>. Introduce tu contraseña para vincularla con Google de forma segura.
              </p>

              <S.Form noValidate onSubmit={(e) => { e.preventDefault(); handleLinkGoogleAccount(); }}>
                <S.FieldWrap>
                  <S.FieldLabel>Contraseña actual</S.FieldLabel>
                  <S.InputGroup>
                    <S.FieldInput
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <S.EyeBtn type="button" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </S.EyeBtn>
                  </S.InputGroup>
                </S.FieldWrap>

                <S.BtnMain type="submit" disabled={loading || !formData.password}>
                  {loading ? <S.Spinner /> : 'Vincular y Entrar'}
                </S.BtnMain>

                <S.SwitchRow>
                  <S.SwitchBtn type="button" onClick={handleCancelGoogleFlow}>
                    Cancelar
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
                <S.Tab $active={isLogin} onClick={() => setIsLogin(true)}>Iniciar sesión</S.Tab>
                <S.Tab $active={!isLogin} onClick={() => setIsLogin(false)}>Registrarse</S.Tab>
              </S.Tabs>

              <S.Form noValidate onSubmit={onLocalSubmit}>
                {!isLogin && (
                  <S.FieldWrap $isName>
                    <S.FieldLabel>Nombre completo</S.FieldLabel>
                    <S.FieldInput
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {fieldHints.name && <S.FieldHint>{fieldHints.name}</S.FieldHint>}
                  </S.FieldWrap>
                )}

                {!isLogin && (
                  <S.FieldWrap $isName>
                    <S.FieldLabel>Teléfono</S.FieldLabel>
                    <S.PhoneInputWrapReg>
                      <S.PhonePrefixReg>+591</S.PhonePrefixReg>
                      <S.FieldInput
                        type="tel"
                        placeholder="Ej: 71234567"
                        value={formData.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          if (digits.length <= 8) {
                            setFormData({ ...formData, phone: digits });
                          }
                        }}
                        maxLength={8}
                      />
                    </S.PhoneInputWrapReg>
                    {formData.phone.length > 0 && formData.phone.length !== 8 && (
                      <S.FieldHint>
                        Tu número debe tener 8 dígitos. Te faltan {8 - formData.phone.length} números.
                      </S.FieldHint>
                    )}
                    {/[^0-9]/.test(formData.phone) && (
                      <S.FieldHint>Entrada inválida. Por favor, ingresa solo números (0-9).</S.FieldHint>
                    )}
                  </S.FieldWrap>
                )}

                <S.FieldWrap>
                  <S.FieldLabel>Correo electrónico</S.FieldLabel>
                  <S.FieldInput
                    type="email"
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {fieldHints.email && <S.FieldHint>{fieldHints.email}</S.FieldHint>}
                </S.FieldWrap>

                <S.FieldWrap>
                  <S.FieldLabel>Contraseña</S.FieldLabel>
                  <S.InputGroup>
                    <S.FieldInput
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <S.EyeBtn type="button" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </S.EyeBtn>
                  </S.InputGroup>
                </S.FieldWrap>

                {!isLogin && passwordFocused && (
                  <S.ValidationList>
                    <S.ValidationItem $isValid={passwordChecks.length}>
                      {passwordChecks.length ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      8+ caracteres
                    </S.ValidationItem>
                    <S.ValidationItem $isValid={passwordChecks.uppercase}>
                      {passwordChecks.uppercase ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      1 mayúscula
                    </S.ValidationItem>
                    <S.ValidationItem $isValid={passwordChecks.symbol}>
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

                  <S.BtnGoogle type="button" onClick={handleGoogleLogin} disabled={loading}>
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


    </S.StyledWrapper>
  );
};

export default AuthPage;