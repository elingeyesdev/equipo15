import { memo, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(11, 15, 26, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: ${fadeIn} 0.6s ease both;
  backdrop-filter: blur(6px);
`;

const Headline = styled.h2`
  font-size: 3rem;
  font-weight: 900;
  color: white;
  margin: 0 0 12px;
  letter-spacing: -1px;
  text-align: center;
`;

const Sub = styled.p`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
`;

interface RaceOverlayProps {
  onShowPodium: () => void;
}

const RaceOverlay = memo(({ onShowPodium }: RaceOverlayProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2500);
    const t2 = setTimeout(() => onShowPodium(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onShowPodium]);

  if (!visible) return null;

  return (
    <Backdrop>
      <Headline>Reto Finalizado</Headline>
      <Sub>Preparando el podio de ideas ganadoras...</Sub>
    </Backdrop>
  );
});

RaceOverlay.displayName = 'RaceOverlay';
export default RaceOverlay;
