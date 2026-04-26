import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import * as S from './AuthPage/styles/AuthStyles';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Pista8Theme } from '../../config/theme';

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

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Pista8Logo = () => (
  <S.LogoWrap>
    <S.LogoSvg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill={Pista8Theme.secondary} letterSpacing="-2">PIST</text>
      <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill={Pista8Theme.primary} />
      <rect x="181" y="65" width="5" height="8" rx="2" fill={Pista8Theme.primary} />
      <rect x="189" y="65" width="5" height="8" rx="2" fill={Pista8Theme.primary} />
      <rect x="197" y="65" width="5" height="8" rx="2" fill={Pista8Theme.primary} />
      <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill={Pista8Theme.secondary}>8</text>
    </S.LogoSvg>
  </S.LogoWrap>
);

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const checks = [
    { label: '8+ caracteres', valid: password.length >= 8 },
    { label: '1 mayúscula', valid: /[A-Z]/.test(password) },
    { label: '1 número', valid: /\d/.test(password) },
  ];
  return (
    <S.ValidationList>
      {checks.map(({ label, valid }) => (
        <S.ValidationItem key={label} isValid={valid}>
          {valid ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          {label}
        </S.ValidationItem>
      ))}
    </S.ValidationList>
  );
};

const SuccessView = ({ onBack }: { onBack: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.22, 0.68, 0, 1.2] }}
    style={{ textAlign: 'center', padding: '8px 0' }}
  >
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: `${Pista8Theme.primary}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px',
    }}>
      <CheckIcon />
    </div>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: Pista8Theme.secondary, marginBottom: 10 }}>
      ¡Contraseña actualizada!
    </h2>
    <p style={{ fontSize: 14, color: '#9aa0a6', marginBottom: 28, lineHeight: 1.6 }}>
      Tu contraseña fue restablecida correctamente.<br />Ya puedes iniciar sesión.
    </p>
    <S.BtnMain type="button" onClick={onBack}>
      Ir al inicio de sesión
    </S.BtnMain>
  </motion.div>
);

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [oobCode] = useState(searchParams.get('oobCode') || '');
  const [email, setEmail] = useState('');
  const [passData, setPassData] = useState({ newPass: '', confirm: '' });
  const [validating, setValidating] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      toast.error('Código de recuperación inválido o expirado.');
      navigate('/auth');
      return;
    }
    const verifyCode = async () => {
      try {
        const userEmail = await authService.verifyResetCode(oobCode);
        setEmail(userEmail);
      } catch {
        toast.error('El enlace de recuperación ha expirado o ya fue utilizado.');
        navigate('/auth');
      } finally {
        setValidating(false);
      }
    };
    verifyCode();
  }, [oobCode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPass !== passData.confirm) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (passData.newPass.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setUpdating(true);
    try {
      await authService.confirmReset(oobCode, passData.newPass);
      setDone(true);
    } catch {
      toast.error('Error al actualizar la contraseña. Intenta solicitar un nuevo link.');
    } finally {
      setUpdating(false);
    }
  };

  if (validating) {
    return (
      <S.StyledWrapper>
        <S.Card style={{ textAlign: 'center' }}>
          <Pista8Logo />
          <S.SepLine />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '12px 0 4px' }}>
            <S.Spinner style={{ borderColor: `${Pista8Theme.primary}30`, borderTopColor: Pista8Theme.primary, width: 28, height: 28 }} />
            <p style={{ fontSize: 14, color: '#9aa0a6', margin: 0 }}>Validando enlace de recuperación…</p>
          </div>
        </S.Card>
      </S.StyledWrapper>
    );
  }

  return (
    <S.StyledWrapper>
      <S.Card>
        <Pista8Logo />
        <S.SepLine />

        <AnimatePresence mode="wait">
          {done ? (
            <SuccessView key="success" onBack={() => navigate('/auth')} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, gap: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `${Pista8Theme.primary}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LockIcon />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: Pista8Theme.secondary, margin: '0 0 6px' }}>
                    Restablecer contraseña
                  </h2>
                  <p style={{ fontSize: 13, color: '#9aa0a6', margin: '0 0 4px' }}>
                    Estás cambiando la clave de:
                  </p>
                  <span style={{ fontSize: 14, fontWeight: 700, color: Pista8Theme.primary }}>
                    {email}
                  </span>
                </div>
              </div>

              <S.Form onSubmit={handleSubmit}>
                <S.FieldWrap>
                  <S.FieldLabel>Nueva contraseña</S.FieldLabel>
                  <S.InputGroup>
                    <S.FieldInput
                      id="new-password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      value={passData.newPass}
                      onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
                    />
                    <S.EyeBtn type="button" onClick={() => setShowPass(!showPass)} aria-label="Mostrar/ocultar contraseña">
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </S.EyeBtn>
                  </S.InputGroup>
                </S.FieldWrap>

                <PasswordStrength password={passData.newPass} />

                <S.FieldWrap>
                  <S.FieldLabel>Confirmar nueva contraseña</S.FieldLabel>
                  <S.InputGroup>
                    <S.FieldInput
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      value={passData.confirm}
                      onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                    />
                    <S.EyeBtn type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Mostrar/ocultar confirmación">
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </S.EyeBtn>
                  </S.InputGroup>
                  {passData.confirm && (
                    <div style={{
                      fontSize: 12, fontWeight: 500, marginTop: 4,
                      color: passData.newPass === passData.confirm ? '#34A853' : Pista8Theme.error,
                      transition: 'color 0.2s',
                    }}>
                      {passData.newPass === passData.confirm ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                    </div>
                  )}
                </S.FieldWrap>

                <S.BtnMain
                  type="submit"
                  disabled={updating || passData.newPass !== passData.confirm || passData.newPass.length < 8}
                >
                  {updating ? <S.Spinner /> : 'Actualizar contraseña'}
                </S.BtnMain>
              </S.Form>

              <S.SwitchRow style={{ marginTop: 20 }}>
                <S.SwitchBtn type="button" onClick={() => navigate('/auth')}>
                  ← Volver al inicio de sesión
                </S.SwitchBtn>
              </S.SwitchRow>
            </motion.div>
          )}
        </AnimatePresence>
      </S.Card>
    </S.StyledWrapper>
  );
};
