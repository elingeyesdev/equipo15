type Props = { color?: string; size?: number };

export const BlockBadgeIcon = ({ color = '#FF3333', size = 12 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.5" />
    <path
      d="M2.636 2.636L9.364 9.364"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
