type Props = { color?: string; size?: number };

export const BuildingIcon = ({ color = '#485054', size = 22 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <rect x="7" y="7" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4" />
    <rect x="14" y="7" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4" />
    <rect x="7" y="13" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4" />
    <rect x="14" y="13" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4" />
    <path d="M10 21V18.5C10 18.224 10.224 18 10.5 18H13.5C13.776 18 14 18.224 14 18.5V21" stroke={color} strokeWidth="1.4" />
  </svg>
);
