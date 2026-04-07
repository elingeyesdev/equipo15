import { useAuthForm } from './AuthPage/hooks/useAuthForm';
import * as S from './AuthPage/styles/AuthStyles';

const AuthPage = () => {
  const {
    isLogin, setIsLogin, formData, setFormData, loading, errorVisible, handleSubmit, handleGoogleLogin,
    passwordChecks, isFormValid
  } = useAuthForm();

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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </S.FieldWrap>

          <S.FieldWrap>
            <S.FieldLabel>Contraseña</S.FieldLabel>
            <S.FieldInput
              type="password"
              placeholder="••••••••"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
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
              <S.ForgotLink href="#">¿Olvidaste tu contraseña?</S.ForgotLink>
            </S.ForgotRow>
          )}

          <S.BtnMain type="submit" disabled={loading || !isFormValid}>
            {loading ? <S.Spinner /> : (isLogin ? 'Entrar' : 'Registrarme')}
          </S.BtnMain>
        </S.Form>

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

        <S.SwitchRow>
          <S.SwitchText>
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          </S.SwitchText>
          <S.SwitchBtn type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </S.SwitchBtn>
        </S.SwitchRow>
      </S.Card>
    </S.StyledWrapper>
  );
};

export default AuthPage;