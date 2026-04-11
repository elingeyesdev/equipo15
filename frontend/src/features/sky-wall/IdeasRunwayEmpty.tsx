import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../config/theme';

const rushForward = keyframes`
  0%   { transform: translateX(-50%) scaleX(1) translateY(0%);   opacity: 0; }
  6%   { opacity: 1; }
  100% { transform: translateX(-50%) scaleX(1.4) translateY(100%); opacity: 0; }
`;

const sidePulse = keyframes`
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 1; }
`;

const dotBlink = keyframes`
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 180px;
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  animation: ${fadeIn} 0.4s ease both;
`;

const GridBg = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

const RunwayStage = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  perspective: 180px;
  perspective-origin: 50% 0%;
  overflow: hidden;
`;

const RunwayPlane = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: rotateX(22deg);
  transform-origin: top center;
  transform-style: preserve-3d;
`;

const LeftEdge = styled.div`
  position: absolute;
  left: calc(50% - 80px);
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.14) 40%, rgba(255,255,255,0.14) 80%, transparent);
`;

const RightEdge = styled.div`
  position: absolute;
  right: calc(50% - 80px);
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.14) 40%, rgba(255,255,255,0.14) 80%, transparent);
`;

const DashLine = styled.div<{ index: number }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 28px;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(255,255,255,0.4);
  top: ${p => p.index * 60 - 200}px;
  animation: ${rushForward} 1s linear infinite;
  animation-delay: ${p => p.index * -0.11}s;
`;

const LeftLights = styled.div`
  position: absolute;
  left: calc(50% - 92px);
  top: 6%;
  bottom: 6%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const RightLights = styled.div`
  position: absolute;
  right: calc(50% - 92px);
  top: 6%;
  bottom: 6%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Light = styled.div<{ index: number; total: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => {
    const t = p.index / (p.total - 1);
    if (t < 0.35) return '#ff2222';
    if (t < 0.7)  return '#ff9900';
    return '#00e676';
  }};
  box-shadow: ${p => {
    const t = p.index / (p.total - 1);
    const c = t < 0.35 ? '#ff2222' : t < 0.7 ? '#ff9900' : '#00e676';
    return `0 0 5px ${c}, 0 0 12px ${c}70`;
  }};
  animation: ${sidePulse} 1.5s ease-in-out ${p => p.index * 0.1}s infinite;
`;

const HorizonGlow = styled.div`
  position: absolute;
  bottom: 30%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent 10%, rgba(254,65,10,0.3) 35%, rgba(254,65,10,0.5) 50%, rgba(254,65,10,0.3) 65%, transparent 90%);
  box-shadow: 0 0 28px 8px rgba(254,65,10,0.1);
  pointer-events: none;
  z-index: 2;
`;

const BottomFade = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28%;
  background: linear-gradient(to top, #1a1f22, transparent);
  pointer-events: none;
  z-index: 3;
`;

const TopFade = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 38%;
  background: linear-gradient(to bottom, #1a1f22 20%, transparent);
  pointer-events: none;
  z-index: 3;
`;

const Label = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
`;

const LabelText = styled.span`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.22);
`;

const Dot = styled.span<{ delay: number }>`
  font-size: 10px;
  color: ${Pista8Theme.primary};
  animation: ${dotBlink} 1.4s ease-in-out ${p => p.delay}s infinite;
`;

const DASH_COUNT = 8;
const LIGHT_COUNT = 7;

const IdeasRunwayEmpty = () => {
  return (
    <Wrap>
      <GridBg />

      <RunwayStage>
        <TopFade />
        <RunwayPlane>
          <LeftEdge />
          <RightEdge />
          <LeftLights>
            {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
              <Light key={i} index={i} total={LIGHT_COUNT} />
            ))}
          </LeftLights>
          <RightLights>
            {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
              <Light key={i} index={i} total={LIGHT_COUNT} />
            ))}
          </RightLights>
          {Array.from({ length: DASH_COUNT }).map((_, i) => (
            <DashLine key={i} index={i} />
          ))}
        </RunwayPlane>
        <HorizonGlow />
        <BottomFade />
      </RunwayStage>

      <Label>
        <LabelText>Las ideas despegan pronto</LabelText>
        <Dot delay={0}>.</Dot>
        <Dot delay={0.3}>.</Dot>
        <Dot delay={0.6}>.</Dot>
      </Label>
    </Wrap>
  );
};

export default IdeasRunwayEmpty;
