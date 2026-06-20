import logoImg from '../../assets/logo.png';
import logoBlancoImg from '../../assets/logo_blanco.png';

interface Pista8LogoProps {
  variant?: 'default' | 'white';
  fill?: string;
  accent?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Pista8Logo = ({
  variant = 'default',
  width = 130,
  height,
  className,
}: Pista8LogoProps) => {
  const src = variant === 'white' ? logoBlancoImg : logoImg;
  return (
    <img
      src={src}
      alt="Pista 8"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Pista8Logo;
