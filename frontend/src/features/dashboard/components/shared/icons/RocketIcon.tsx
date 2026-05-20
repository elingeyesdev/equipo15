type Props = { color?: string; size?: number };

export const RocketIcon = ({ color = '#FE410A', size = 22 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C12 2 8 6.5 8 12C8 14.5 9 16.5 10 18L14 18C15 16.5 16 14.5 16 12C16 6.5 12 2 12 2Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="11" r="1.5" stroke={color} strokeWidth="1.4" />
    <path d="M10 18L9 22H15L14 18" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8 10C6 10 4 11.5 3.5 14L8 13" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 10C18 10 20 11.5 20.5 14L16 13" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
