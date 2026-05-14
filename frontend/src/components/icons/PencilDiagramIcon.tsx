import type { SVGProps } from 'react';

const PencilDiagramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    <line x1="3" y1="12" x2="7" y2="12" />
    <line x1="5" y1="10" x2="5" y2="14" />
  </svg>
);

export default PencilDiagramIcon;
