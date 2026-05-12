interface PaleoIconProps {
  className?: string;
}

export const PaleoIcon = ({ className }: PaleoIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <rect
      x="0.5" y="0.5" width="35" height="35" rx="5.5"
      style={{ fill: 'var(--parch)', stroke: 'var(--bdr)' }}
      strokeWidth="1"
    />
    <text
      x="18" y="25.5"
      fontFamily="'Cormorant Garamond', 'Cormorant', Georgia, 'Times New Roman', serif"
      fontSize="22"
      fontWeight="600"
      style={{ fill: 'var(--blue)' }}
      textAnchor="middle"
      dominantBaseline="auto"
    >
      Π
    </text>
    <rect x="8" y="29" width="20" height="1.5" rx="0.75" style={{ fill: 'var(--gold)' }} />
  </svg>
);
