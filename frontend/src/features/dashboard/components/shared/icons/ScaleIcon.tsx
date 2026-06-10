type Props = { color?: string; size?: number };

export const ScaleIcon = ({ color = 'currentColor', size = 22 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3V21"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M5 7H19"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M7 7L4 13C4 14.1 5.12 15 6.5 15C7.88 15 9 14.1 9 13L7 7Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M17 7L20 13C20 14.1 18.88 15 17.5 15C16.12 15 15 14.1 15 13L17 7Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 15H17.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
