import React from 'react';
import styled, { keyframes } from 'styled-components';
import { MousePointerClick, SearchCode, Send, Rocket } from 'lucide-react';
import { Pista8Theme } from '../../../config/theme';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  padding: 32px 28px;
  height: 100%;
  animation: ${fadeUp} 0.5s 0.1s ease both;
`;

const HeadBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
`;

const Heading = styled.h2`
  font-size: 22px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  line-height: 1.25;
`;

const Sub = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.55;
`;

const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepItem = styled.li<{ $delay: number }>`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  background: white;
  border-radius: 18px;
  border: 1.5px solid rgba(72, 80, 84, 0.07);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  animation: ${fadeUp} 0.45s ${p => p.$delay}s ease both;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

  &:hover {
    border-color: rgba(254, 65, 10, 0.2);
    box-shadow: 0 6px 20px rgba(254, 65, 10, 0.07);
    transform: translateX(4px);
  }
`;

const IconBox = styled.div<{ $color: string; $bg: string }>`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 20px; height: 20px; }
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const StepNumber = styled.span`
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
`;

const StepTitle = styled.p`
  font-size: 14px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const StepDesc = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

const RocketBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${Pista8Theme.primary}, #ff7b00);
  color: white;
  font-size: 13px;
  font-weight: 800;
  align-self: center;
  animation: ${pulse} 2.5s ease infinite;
  box-shadow: 0 6px 20px rgba(254, 65, 10, 0.25);

  svg { width: 16px; height: 16px; }
`;

const STEPS = [
  {
    icon: MousePointerClick,
    color: '#4f46e5',
    bg: 'rgba(79, 70, 229, 0.1)',
    label: 'Paso 1',
    title: 'Elige un reto',
    desc: 'Selecciona un reto de la lista lateral para conocer el problema que las empresas necesitan resolver.',
    delay: 0.15,
  },
  {
    icon: SearchCode,
    color: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.1)',
    label: 'Paso 2',
    title: 'Lee los criterios',
    desc: 'Revisa detenidamente los criterios de evaluación: Deseabilidad, Factibilidad y Viabilidad.',
    delay: 0.25,
  },
  {
    icon: Send,
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.1)',
    label: 'Paso 3',
    title: '¡Publica tu propuesta!',
    desc: 'Sube tu idea siguiendo el modelo estructurado para maximizar tus posibilidades de ganar.',
    delay: 0.35,
  },
];

const InnovationStepsPanel: React.FC = () => (
  <Wrapper>
    <HeadBlock>
      <Eyebrow>Guía rápida</Eyebrow>
      <Heading>¿Cómo participar?</Heading>
      <Sub>Sigue estos pasos para enviar tu propuesta y competir en el reto seleccionado.</Sub>
    </HeadBlock>

    <StepList>
      {STEPS.map(({ icon: Icon, color, bg, label, title, desc, delay }) => (
        <StepItem key={label} $delay={delay}>
          <IconBox $color={color} $bg={bg}>
            <Icon />
          </IconBox>
          <StepContent>
            <StepNumber>{label}</StepNumber>
            <StepTitle>{title}</StepTitle>
            <StepDesc>{desc}</StepDesc>
          </StepContent>
        </StepItem>
      ))}
    </StepList>

    <RocketBadge>
      <Rocket /> ¡Selecciona un reto para empezar!
    </RocketBadge>
  </Wrapper>
);

export default InnovationStepsPanel;
