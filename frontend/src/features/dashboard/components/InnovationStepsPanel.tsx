import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../../config/theme';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 32px 0 0 0;
  height: 100%;
  animation: ${fadeUp} 0.5s 0.1s ease both;
`;

const HeadBlock = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 18px;
  margin-bottom: 6px;
`;

const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: ${Pista8Theme.primary};
  margin: 0;
`;

const Heading = styled.h2`
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.3px;
  line-height: 1.25;
  color: ${Pista8Theme.secondary};
  margin: 4px 0 0;
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
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 18px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  animation: ${fadeUp} 0.45s ${p => p.$delay}s ease both;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

  &:hover {
    border-color: rgba(254, 65, 10, 0.2);
    box-shadow: 0 6px 20px rgba(254, 65, 10, 0.07);
    transform: translateX(4px);
  }
`;

const IconCircle = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${Pista8Theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  font-size: 20px;
  font-weight: 800;
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StepTitle = styled.p`
  font-size: 14px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.1px;
`;

const StepDesc = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 5px 0 0;
  line-height: 1.45;
`;

const STEPS = [
  {
    number: '1',
    title: 'Encontrá tu reto ideal',
    desc: 'Explorá la vista lateral "Explorar retos" y descubrí el reto que más suene con vos',
    delay: 0.15,
  },
  {
    number: '2',
    title: 'Revisa las reglas del reto',
    desc: 'Revisa los criterios de evaluación que se tomarán en cuenta',
    delay: 0.25,
  },
  {
    number: '3',
    title: '¡Subí tu idea!',
    desc: 'Completa tu idea paso a paso y da el salto para ganar el desafío',
    delay: 0.35,
  },
];

const InnovationStepsPanel: React.FC = () => (
  <Wrapper>
    <HeadBlock>
      <Eyebrow>Guía rápida</Eyebrow>
      <Heading>Seguí estos pasos para participar</Heading>
    </HeadBlock>

    <StepList>
      {STEPS.map(({ number, title, desc, delay }) => (
        <StepItem key={number} $delay={delay}>
          <IconCircle>
            {number}
          </IconCircle>
          <StepContent>
            <StepTitle>{title}</StepTitle>
            <StepDesc>{desc}</StepDesc>
          </StepContent>
        </StepItem>
      ))}
    </StepList>

  </Wrapper>
);

export default InnovationStepsPanel;
