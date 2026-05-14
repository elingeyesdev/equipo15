type Props = { color?: string; size?: number };

export const ClockBadgeIcon = ({ color = '#C47D0E', size = 12 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.5" />
    <path
      d="M6 3.5V6.25L7.75 7.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
