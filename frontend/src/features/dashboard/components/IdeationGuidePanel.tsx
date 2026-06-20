

interface StepConfig {
  number: string;
  label: string;
  description: string;
  delay: number;
}

const STEPS: readonly StepConfig[] = [
  {
    number: '1',
    label: 'Entendé el problema',
    description:
      'Analizá la descripción y el contexto de la empresa para asegurarte de que tu idea resuelva el dolor principal.',
    delay: 0,
  },
  {
    number: '2',
    label: 'Revisá las reglas',
    description:
      'Verificá las restricciones de participación y los entregables solicitados para que tu idea no sea descartada.',
    delay: 80,
  },
  {
    number: '3',
    label: 'Estructurá tu solución',
    description:
      'Usá el modelo estructurado para detallar tu propuesta. Una idea bien explicada tiene más chances de llegar al podio.',
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
    padding: '12px 28px',
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
    gap: '12px',
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
  const { number, label, description, delay } = step;

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 20px',
        background: 'white',
        borderRadius: '18px',
        border: '1px solid rgba(72, 80, 84, 0.08)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        animation: `guideStepIn 0.4s ${delay}ms ease both`,
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
    >
      {/* Círculo naranja con el número */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#FE410A',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '20px',
          fontWeight: 800,
        }}
      >
        {number}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1a1f22', letterSpacing: '-0.1px' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
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
      li:hover {
        border-color: rgba(254, 65, 10, 0.2) !important;
        box-shadow: 0 6px 20px rgba(254, 65, 10, 0.07) !important;
        transform: translateX(4px);
      }
    `}</style>
    <div style={styles.root}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Guía rápida</span>
        <h2 style={styles.title}>Seguí estos pasos para participar</h2>
        <p style={styles.subtitle}>Tres pasos clave antes de enviar tu propuesta.</p>
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
