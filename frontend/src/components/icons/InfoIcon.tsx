const InfoIcon = ({ width = 16, height = 16, color = '#FE410A', ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill="white" />
    <rect x="11" y="10" width="2" height="6" rx="1" fill={color} />
    <rect x="11" y="7" width="2" height="2" rx="1" fill={color} />
  </svg>
);

export default InfoIcon;
