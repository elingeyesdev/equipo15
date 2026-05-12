import React from 'react';

const MEDAL_COLORS: Record<number, { primary: string; secondary: string; accent: string }> = {
  0: { primary: '#FFD700', secondary: '#FFA000', accent: '#B8860B' },
  1: { primary: '#C0C0C0', secondary: '#A8A8A8', accent: '#808080' },
  2: { primary: '#CD7F32', secondary: '#A0522D', accent: '#8B4513' },
};

interface MedalSvgProps {
  rank: number;
  size?: number;
}

const MedalSvg: React.FC<MedalSvgProps> = ({ rank, size = 22 }) => {
  const colors = MEDAL_COLORS[rank];
  if (!colors) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 2L5 7H9L7.5 2Z"
        fill={colors.accent}
        opacity="0.6"
      />
      <path
        d="M16.5 2L19 7H15L16.5 2Z"
        fill={colors.accent}
        opacity="0.6"
      />
      <circle
        cx="12"
        cy="14"
        r="7.5"
        fill={`url(#medal-grad-${rank})`}
        stroke={colors.accent}
        strokeWidth="1"
      />
      <circle
        cx="12"
        cy="14"
        r="5.5"
        fill="none"
        stroke={colors.accent}
        strokeWidth="0.5"
        opacity="0.5"
      />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="7"
        fontWeight="900"
        fill={colors.accent}
        fontFamily="Arial, sans-serif"
      >
        {rank + 1}
      </text>
      <defs>
        <linearGradient id={`medal-grad-${rank}`} x1="4.5" y1="6.5" x2="19.5" y2="21.5">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default MedalSvg;
