import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../config/theme';

const rushForward = keyframes`
  0%   { transform: scaleX(1)    translateY(0%);   opacity: 0; }
  6%   { opacity: 1; }
  100% { transform: scaleX(2.8)  translateY(100%); opacity: 0; }
`;

const sideLightPulse = keyframes`
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 1; }
`;

const logoGlow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 6px ${Pista8Theme.primary}55); }
  50%       { filter: drop-shadow(0 0 22px ${Pista8Theme.primary}cc); }
`;

const dotBlink = keyframes`
  0%, 100% { opacity: 0.15; }
  50%       { opacity: 1; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Root = styled.div`
  height: 100vh;
  width: 100%;
  background: #080b0d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const Stage = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55vh;
  perspective: 300px;
  perspective-origin: 50% 0%;
  overflow: hidden;
`;

const RunwayPlane = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: rotateX(28deg);
  transform-origin: top center;
  transform-style: preserve-3d;
`;

const LeftEdge = styled.div`
  position: absolute;
  left: calc(50% - 100px);
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.18) 80%, transparent);
`;

const RightEdge = styled.div`
  position: absolute;
  right: calc(50% - 100px);
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.18) 80%, transparent);
`;

const DashLine = styled.div<{ index: number }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 40px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 5px;
  box-shadow: 0 0 8px rgba(255,255,255,0.5);
  top: ${p => p.index * 90 - 300}px;
  animation: ${rushForward} 1.1s linear infinite;
  animation-delay: ${p => p.index * -0.115}s;
`;

const LeftLights = styled.div`
  position: absolute;
  left: calc(50% - 112px);
  top: 4%;
  bottom: 4%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const RightLights = styled.div`
  position: absolute;
  right: calc(50% - 112px);
  top: 4%;
  bottom: 4%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const RunwayLight = styled.div<{ index: number; total: number }>`
  width: 8px;
  height: 8px;
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
    return `0 0 6px ${c}, 0 0 16px ${c}80`;
  }};
  animation: ${css`${sideLightPulse}`} 1.5s ease-in-out ${p => p.index * 0.1}s infinite;
`;

const HorizonGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent 5%, rgba(254,65,10,0.35) 35%, rgba(254,65,10,0.55) 50%, rgba(254,65,10,0.35) 65%, transparent 95%);
  box-shadow: 0 0 40px 12px rgba(254,65,10,0.12);
  z-index: 4;
`;

const BottomFade = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(to top, #080b0d, transparent);
  pointer-events: none;
  z-index: 3;
`;

const TopFade = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 35%;
  background: linear-gradient(to bottom, #080b0d 30%, transparent);
  pointer-events: none;
  z-index: 3;
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeInUp} 0.7s ease both;
  margin-bottom: 18vh;
`;

const LogoWrap = styled.div`
  animation: ${logoGlow} 2.6s ease-in-out infinite;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatusText = styled.p`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
`;

const Dot = styled.span<{ delay: number }>`
  font-size: 11px;
  color: ${Pista8Theme.primary};
  animation: ${dotBlink} 1.4s ease-in-out ${p => p.delay}s infinite;
`;

const DASH_COUNT = 12;
const LIGHT_COUNT = 10;

const RunwayLoader = () => {
  return (
    <Root>
      <Stage>
        <HorizonGlow />
        <TopFade />
        <RunwayPlane>
          <LeftEdge />
          <RightEdge />
          <LeftLights>
            {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
              <RunwayLight key={i} index={i} total={LIGHT_COUNT} />
            ))}
          </LeftLights>
          <RightLights>
            {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
              <RunwayLight key={i} index={i} total={LIGHT_COUNT} />
            ))}
          </RightLights>
          {Array.from({ length: DASH_COUNT }).map((_, i) => (
            <DashLine key={i} index={i} />
          ))}
        </RunwayPlane>
        <BottomFade />
      </Stage>

      <Content>
        <LogoWrap>
          <svg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" width="136" height="35">
            <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white" letterSpacing="-2">PIST</text>
            <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
            <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
            <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white">8</text>
          </svg>
        </LogoWrap>
        <StatusRow>
          <StatusText>Preparando despegue</StatusText>
          <Dot delay={0}>.</Dot>
          <Dot delay={0.3}>.</Dot>
          <Dot delay={0.6}>.</Dot>
        </StatusRow>
      </Content>
    </Root>
  );
};

export default RunwayLoader;
