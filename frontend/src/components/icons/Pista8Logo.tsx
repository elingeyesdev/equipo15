import type { SVGProps } from 'react';
import { Pista8Theme } from '../../config/theme';

interface Pista8LogoProps extends Omit<SVGProps<SVGSVGElement>, 'fill'> {
  fill?: string;
  accent?: string;
}

const Pista8Logo = ({
  fill = Pista8Theme.white,
  accent = Pista8Theme.primary,
  width = 110,
  height = 28,
  ...props
}: Pista8LogoProps) => (
  <svg
    viewBox="0 0 280 72"
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    {...props}
  >
    <text
      x="0"
      y="60"
      fontFamily="Arial Black, Arial, sans-serif"
      fontWeight="900"
      fontSize="64"
      fill={fill}
      letterSpacing="-2"
    >
      PIST
    </text>
    <polygon
      points="186,7 202,40 195,40 195,62 179,62 179,40 172,40"
      fill={accent}
    />
    <rect x="181" y="65" width="5" height="8" rx="2" fill={accent} />
    <rect x="189" y="65" width="5" height="8" rx="2" fill={accent} />
    <rect x="197" y="65" width="5" height="8" rx="2" fill={accent} />
    <text
      x="209"
      y="60"
      fontFamily="Arial Black, Arial, sans-serif"
      fontWeight="900"
      fontSize="64"
      fill={fill}
    >
      8
    </text>
  </svg>
);

export default Pista8Logo;
