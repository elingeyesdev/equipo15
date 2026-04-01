import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../config/theme';
import { authService } from '../../services/auth.service';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.register(formData.email, formData.password, formData.name);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await authService.loginWithGoogle();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="card">

        <div className="logo-wrap">
          <svg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#485054" letterSpacing="-2">PIST</text>
            <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
            <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="#485054">8</text>
          </svg>
        </div>

        <div className="sep-line" />

        <div className="tabs">
          <button
            type="button"
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>

        <form className="fields" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="field-wrap name-field">
              <label className="field-label">Nombre completo</label>
              <input
                className="field-input"
                type="text"
                placeholder="Tu nombre"
                required={!isLogin}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="field-wrap">
            <label className="field-label">Correo electrónico</label>
            <input
              className="field-input"
              type="email"
              placeholder="tu@correo.com"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="field-wrap">
            <label className="field-label">Contraseña</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {isLogin && (
            <div className="forgot-row">
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>
          )}

          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? <span className="spinner" /> : (isLogin ? 'Entrar' : 'Registrarme')}
          </button>
        </form>

        <div className="or-row">
          <div className="or-line" />
          <span className="or-text">o continúa con</span>
          <div className="or-line" />
        </div>

        <button type="button" className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          Continuar con Google
        </button>

        <div className="switch-row">
          <span className="switch-text">
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          </span>
          <button type="button" className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>

      </div>
    </StyledWrapper>
  );
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; transform: translateY(-10px); }
  to   { opacity: 1; max-height: 90px; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${Pista8Theme.background};
  padding: 2rem 1rem;

  .card {
    background: ${Pista8Theme.white};
    border-radius: 32px;
    padding: 48px 44px 40px;
    width: 100%;
    max-width: 460px;
    border: 1px solid rgba(72, 80, 84, 0.1);
    animation: ${fadeUp} 0.45s cubic-bezier(.22, .68, 0, 1.2) both;
  }

  .logo-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
  }

  .logo-svg {
    width: 220px;
    height: auto;
  }

  .sep-line {
    height: 1px;
    background: rgba(72, 80, 84, 0.09);
    margin-bottom: 30px;
  }

  .tabs {
    display: flex;
    background: ${Pista8Theme.background};
    border-radius: 16px;
    padding: 5px;
    margin-bottom: 30px;
    gap: 4px;
  }

  .tab {
    flex: 1;
    padding: 12px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #9aa0a6;
    border-radius: 12px;
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all 0.22s ease;
  }

  .tab.active {
    background: ${Pista8Theme.white};
    color: ${Pista8Theme.secondary};
    border: 0.5px solid rgba(72, 80, 84, 0.13);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .name-field {
    animation: ${slideDown} 0.3s cubic-bezier(.22, .68, 0, 1.1) both;
    overflow: hidden;
  }

  .field-label {
    font-size: 13px;
    font-weight: 500;
    color: ${Pista8Theme.secondary};
    letter-spacing: 0.01em;
  }

  .field-input {
    width: 100%;
    background: ${Pista8Theme.background};
    border: 1.5px solid transparent;
    border-radius: 14px;
    padding: 15px 18px;
    font-size: 15px;
    color: ${Pista8Theme.secondary};
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, background 0.2s;

    &::placeholder {
      color: #c0c6cb;
    }

    &:focus {
      border-color: ${Pista8Theme.primary};
      background: ${Pista8Theme.white};
    }
  }

  .forgot-row {
    display: flex;
    justify-content: flex-end;
    margin-top: -4px;
  }

  .forgot-link {
    font-size: 13px;
    color: ${Pista8Theme.primary};
    text-decoration: none;
    opacity: 0.82;
    transition: opacity 0.15s;

    &:hover {
      opacity: 1;
    }
  }

  .btn-main {
    width: 100%;
    background: ${Pista8Theme.primary};
    color: ${Pista8Theme.white};
    border: none;
    border-radius: 14px;
    padding: 17px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    transition: opacity 0.15s, transform 0.12s;

    &:hover:not(:disabled) {
      opacity: 0.88;
    }

    &:active:not(:disabled) {
      transform: scale(0.975);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ${spin} 0.65s linear infinite;
    display: inline-block;
  }

  .or-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0 16px;
  }

  .or-line {
    flex: 1;
    height: 1px;
    background: rgba(72, 80, 84, 0.09);
  }

  .or-text {
    font-size: 13px;
    color: #c0c6cb;
    white-space: nowrap;
  }

  .btn-google {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: ${Pista8Theme.white};
    color: ${Pista8Theme.secondary};
    padding: 15px;
    border-radius: 14px;
    border: 1px solid rgba(72, 80, 84, 0.16);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s, transform 0.12s;

    &:hover:not(:disabled) {
      background: ${Pista8Theme.background};
      border-color: #4285F4;
    }

    &:active:not(:disabled) {
      transform: scale(0.975);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .switch-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 24px;
  }

  .switch-text {
    font-size: 14px;
    color: #9aa0a6;
  }

  .switch-btn {
    background: none;
    border: none;
    color: ${Pista8Theme.primary};
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.75;
    }
  }
`;

export default AuthPage;