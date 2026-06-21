import React from 'react';
import styled, { keyframes } from 'styled-components';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type StatusVariant =
  | 'activo'     | 'published'
  | 'evaluating' | 'en evaluación' | 'evaluation'
  | 'finalizado' | 'closed'
  | 'borrador'   | 'draft'
  | 'agendado'   | 'scheduled'
  | 'completado' | 'evaluated'
  | 'pendiente'
  | 'inactivo'
  | string;

// ─── Paleta unificada de estados ──────────────────────────────────────────────
interface StatusStyle {
  dot: string;
  label: string;
  pulse?: boolean;
}

const STATUS_MAP: Record<string, StatusStyle> = {
  activo:          { dot: '#10b981', label: 'Activo',        pulse: true  },
  published:       { dot: '#10b981', label: 'Activo',        pulse: true  },
  'en evaluación': { dot: '#f59e0b', label: 'En Evaluación', pulse: false },
  evaluating:      { dot: '#f59e0b', label: 'En Evaluación', pulse: false },
  evaluation:      { dot: '#f59e0b', label: 'En Evaluación', pulse: false },
  finalizado:      { dot: '#ef4444', label: 'Finalizado',    pulse: false },
  closed:          { dot: '#ef4444', label: 'Finalizado',    pulse: false },
  borrador:        { dot: '#94a3b8', label: 'Borrador',      pulse: false },
  draft:           { dot: '#94a3b8', label: 'Borrador',      pulse: false },
  agendado:        { dot: '#3b82f6', label: 'Agendado',      pulse: false },
  scheduled:       { dot: '#3b82f6', label: 'Agendado',      pulse: false },
  completado:      { dot: '#10b981', label: 'Completado',    pulse: false },
  evaluated:       { dot: '#10b981', label: 'Evaluado',      pulse: false },
  pendiente:       { dot: '#f97316', label: 'Pendiente',     pulse: false },
  inactivo:        { dot: '#94a3b8', label: 'Inactivo',      pulse: false },
};

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.85); }
`;

// ─── Styled components ────────────────────────────────────────────────────────
const Wrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  letter-spacing: 0.01em;
`;

const Dot = styled.span<{ $color: string; $pulse: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
  animation: ${p => p.$pulse ? pulse : 'none'} 1.8s ease-in-out infinite;
`;

// ─── Función helper para obtener el estilo ───────────────────────────────────
export const getStatusStyle = (status: string): StatusStyle => {
  const key = (status || '').toLowerCase().trim();
  return STATUS_MAP[key] ?? {
    dot: '#94a3b8',
    label: status || '—', pulse: false,
  };
};

// ─── Componente principal ─────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: string;
  /** Texto personalizado que sobreescribe el label del mapa */
  label?: string;
  /** Mostrar el punto indicador (default: true) */
  showDot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true,
  className,
  style,
}) => {
  const s = getStatusStyle(status);
  const displayLabel = label ?? s.label;

  return (
    <Wrap
      className={className}
      style={style}
    >
      {showDot && <Dot $color={s.dot} $pulse={!!s.pulse} />}
      {displayLabel}
    </Wrap>
  );
};

export default StatusBadge;
