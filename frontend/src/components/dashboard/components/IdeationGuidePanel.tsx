import React, { type SVGProps } from 'react';
import MagnifierIcon from './icons/MagnifierIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import PencilDiagramIcon from './icons/PencilDiagramIcon';

type StepIconComponent = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

interface StepConfig {
  number: string;
  label: string;
  description: string;
  Icon: StepIconComponent;
  accent: string;
  accentBg: string;
  delay: number;
}

const STEPS: readonly StepConfig[] = [
  {
    number: '01',
    label: 'Entiende el problema',
    description:
      'Analiza la descripción y el contexto de la empresa para asegurar que tu idea resuelva el dolor principal.',
    Icon: MagnifierIcon,
    accent: '#4f46e5',
    accentBg: 'rgba(79,70,229,0.10)',
    delay: 0,
  },
  {
    number: '02',
    label: 'Revisa las reglas',
    description:
      'Verifica las restricciones de participación y los entregables solicitados para que tu idea no sea descartada.',
    Icon: ShieldCheckIcon,
    accent: '#0891b2',
    accentBg: 'rgba(8,145,178,0.10)',
    delay: 80,
  },
  {
    number: '03',
    label: 'Estructura tu solución',
    description:
      'Usa el modelo estructurado para detallar tu propuesta. Una idea bien explicada tiene más chances de llegar al podio.',
    Icon: PencilDiagramIcon,
    accent: '#FE410A',
    accentBg: 'rgba(254,65,10,0.10)',
    delay: 160,
  },
] as const;

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '36px 28px',
    gap: '24px',
    boxSizing: 'border-box' as const,
  },
  header: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  eyebrow: {
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: '#FE410A',
    display: 'block',
  },
  title: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1a1f22',
    margin: 0,
    lineHeight: 1.25,
  },
  subtitle: {
    fontSize: '12.5px',
    color: '#9ca3af',
    margin: 0,
    lineHeight: 1.6,
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    width: '100%',
    maxWidth: '480px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
};

interface StepItemProps {
  step: StepConfig;
}

const StepItem = ({ step }: StepItemProps) => {
  const { number, label, description, Icon, accent, accentBg, delay } = step;

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        border: '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        animation: `guideStepIn 0.4s ${delay}ms ease both`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          background: accentBg,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon width={20} height={20} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontSize: '9.5px',
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          Paso {number}
        </span>
        <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#1a1f22' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '11.5px', color: '#6b7280', lineHeight: 1.55 }}>
          {description}
        </p>
      </div>
    </li>
  );
};

const IdeationGuidePanel = () => (
  <>
    <style>{`
      @keyframes guideStepIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <div style={styles.root}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Tu ruta hacia la innovación</span>
        <h2 style={styles.title}>Por dónde empezar</h2>
        <p style={styles.subtitle}>Sigue estos tres pasos antes de enviar tu propuesta.</p>
      </div>
      <ol style={styles.list}>
        {STEPS.map((step) => (
          <StepItem key={step.number} step={step} />
        ))}
      </ol>
    </div>
  </>
);

export default IdeationGuidePanel;
