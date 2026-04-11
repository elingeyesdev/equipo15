import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import * as S from './AuthPage/styles/AuthStyles';
import { toast } from 'sonner';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [oobCode] = useState(searchParams.get('oobCode') || '');
  const [email, setEmail] = useState('');
  const [passData, setPassData] = useState({ newPass: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [updating, setUpdating] = useState(false);
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
      } catch (error: any) {
        toast.error('El enlace de recuperación ha expirado o ya fue utilizado.');
        navigate('/auth');
      } finally {
        setLoading(false);
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
      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
      navigate('/auth');
    } catch (error: any) {
      toast.error('Error al actualizar la contraseña. Intenta solicitar un nuevo link.');
    } finally {
      setUpdating(false);
    }
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

  if (validating) {
    return (
      <S.StyledWrapper>
        <S.Card style={{ textAlign: 'center' }}>
          <S.Spinner style={{ borderTopColor: '#485054' }} />
          <p style={{ marginTop: '1rem', color: '#9aa0a6' }}>Validando enlace...</p>
        </S.Card>
      </S.StyledWrapper>
    );
  }

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

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#485054', marginBottom: '8px' }}>Restablecer contraseña</h2>
          <p style={{ fontSize: '14px', color: '#9aa0a6' }}>Estás cambiando la clave para:</p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#FE410A' }}>{email}</p>
        </div>

        <S.Form onSubmit={handleSubmit}>
          <S.FieldWrap>
            <S.FieldLabel>Nueva contraseña</S.FieldLabel>
            <S.InputGroup>
              <S.FieldInput
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                required
                value={passData.newPass}
                onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
              />
              <S.EyeBtn type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </S.EyeBtn>
            </S.InputGroup>
          </S.FieldWrap>

          <S.FieldWrap>
            <S.FieldLabel>Confirmar nueva contraseña</S.FieldLabel>
            <S.InputGroup>
              <S.FieldInput
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                required
                value={passData.confirm}
                onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
              />
              <S.EyeBtn type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </S.EyeBtn>
            </S.InputGroup>
          </S.FieldWrap>

          <S.BtnMain type="submit" disabled={updating}>
            {updating ? <S.Spinner /> : 'Actualizar Contraseña'}
          </S.BtnMain>
        </S.Form>
      </S.Card>
    </S.StyledWrapper>
  );
};
