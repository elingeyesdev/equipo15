import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../config/theme';

const sweep = keyframes`
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const expand = keyframes`
  0%   { width: 0%; }
  60%  { width: 80%; }
  85%  { width: 92%; }
  100% { width: 96%; }
`;

const dotBlink = keyframes`
  0%, 100% { opacity: 0.2; transform: translateY(0px); }
  50%       { opacity: 1;   transform: translateY(-2px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  animation: ${fadeIn} 0.5s ease both;
`;

const Label = styled.div`
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(72, 80, 84, 0.65);
`;

const Track = styled.div`
  position: relative;
  width: 240px;
  height: 10px;
  background: rgba(72, 80, 84, 0.1);
  border-radius: 99px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(72, 80, 84, 0.15);
`;

const Fill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(
    90deg,
    ${Pista8Theme.primary},
    #ff7043,
    ${Pista8Theme.primary},
    #ff9a6c,
    ${Pista8Theme.primary}
  );
  background-size: 300% 100%;
  animation:
    ${expand} 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite,
    ${sweep} 2s linear infinite;
`;

const DotRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Dot = styled.div<{ delay: number }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${Pista8Theme.primary};
  opacity: 0.3;
  animation: ${dotBlink} 1.2s ease-in-out ${p => p.delay}s infinite;
`;

const Sub = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(72, 80, 84, 0.55);
  letter-spacing: 0.04em;
`;

const IdeasLoader = () => {
  return (
    <Wrap>
      <Label>Pista 8</Label>

      <Track>
        <Fill />
      </Track>

      <DotRow>
        <Dot delay={0} />
        <Dot delay={0.15} />
        <Dot delay={0.3} />
      </DotRow>

      <Sub>Las ideas aparecerán aquí al publicarse</Sub>
    </Wrap>
  );
};

export default IdeasLoader;
