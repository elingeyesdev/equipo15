import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Pista8Theme } from '../../config/theme';

const FACULTIES = [
  { id: 1, name: 'Facultad de Ciencia y Tecnología' },
  { id: 2, name: 'Facultad de Medicina' },
  { id: 3, name: 'Facultad de Ciencias Económicas' },
  { id: 4, name: 'Facultad de Ciencias Jurídicas' },
  { id: 5, name: 'Facultad de Arquitectura' },
  { id: 6, name: 'Facultad de Ingeniería' },
];

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
  display: inline-block;
`;

const ButtonInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Pista8Theme.background};
  padding: 1.5rem;
`;

const Card = styled.div`
  background: white;
  padding: 48px 44px 44px;
  border-radius: 28px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 8px 40px rgba(72, 80, 84, 0.1);
  max-width: 460px;
  width: 100%;
  animation: ${fadeUp} 0.45s cubic-bezier(0.22, 0.68, 0, 1.1) both;
`;

const IconWrap = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: ${Pista8Theme.primary}12;
  border: 1.5px solid ${Pista8Theme.primary}22;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0 0 12px;
  letter-spacing: -0.4px;
  text-align: center;
  span { color: ${Pista8Theme.primary}; }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  margin: 0 0 20px;
  line-height: 1.65;
  text-align: center;
  font-weight: 500;
`;

const SelectLabel = styled.p`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${Pista8Theme.secondary};
  margin: 0 0 8px;
  text-align: left;
`;

const SelectWrap = styled.div`
  position: relative;
  margin-bottom: 24px;

  &::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid ${Pista8Theme.secondary};
    pointer-events: none;
    opacity: 0.4;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 40px 14px 16px;
  border: 1.5px solid rgba(72, 80, 84, 0.12);
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  background: rgba(248, 249, 250, 0.8);
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;

  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}18;
  }

  option[value=''] {
    color: #a8b0b8;
  }
`;

const Button = styled.button<{ disabled: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${p => p.disabled ? 'rgba(72,80,84,0.08)' : Pista8Theme.primary};
  color: ${p => p.disabled ? '#b8c0c8' : 'white'};
  border: none;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.02em;
  border-radius: 14px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  transition: transform 0.12s, box-shadow 0.2s, background 0.25s, color 0.25s;
  box-shadow: ${p => p.disabled ? 'none' : `0 4px 18px ${Pista8Theme.primary}38`};

  ${p => !p.disabled && css`
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px ${Pista8Theme.primary}4a;
    }
    &:active {
      transform: translateY(0) scale(0.98);
      box-shadow: 0 2px 10px ${Pista8Theme.primary}30;
    }
  `}
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(72, 80, 84, 0.07);
  margin: 16px 0;
`;

export const CompleteProfileView = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFaculty || !user) return;
    setLoading(true);

    try {
      const token = await user.getIdToken();

      const res = await fetch('http://localhost:3000/api/users/faculty', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ facultyId: Number(selectedFaculty) }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      onComplete();
    } catch {
      alert('Error sincronizando la facultad. Intente de nuevo.');
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <IconWrap>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </IconWrap>

        <Title>Último <span>Paso</span></Title>
        <Subtitle>
          Tu correo no especifica una rama clara. Para mostrarte retos acordes y puntuar correctamente tus ideas, seleccioná tu facultad.
        </Subtitle>

        <Divider />

        <SelectLabel>Tu Facultad</SelectLabel>
        <SelectWrap>
          <Select
            value={selectedFaculty}
            onChange={e => setSelectedFaculty(e.target.value)}
          >
            <option value="" disabled>Selecciona una opción...</option>
            {FACULTIES.map(fac => (
              <option key={fac.id} value={fac.id}>{fac.name}</option>
            ))}
          </Select>
        </SelectWrap>

        <Button onClick={handleSubmit} disabled={!selectedFaculty || loading}>
          <ButtonInner>
            {loading && <Spinner />}
            {loading ? 'Guardando...' : 'Comenzar a Idear'}
          </ButtonInner>
        </Button>
      </Card>
    </Wrapper>
  );
};