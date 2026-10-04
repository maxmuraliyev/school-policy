import { Shield } from 'lucide-react';

interface HouseBadgeProps {
  name: string;
  slug?: string;
  symbol?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'subtle';
  showSymbol?: boolean;
}

export default function HouseBadge({
  name,
  slug,
  symbol,
  color,
  size = 'md',
  variant = 'subtle',
  showSymbol = true,
}: HouseBadgeProps) {
  const isAstra = slug === 'astra' || name.toLowerCase().includes('astra');
  const houseColor = color || (isAstra ? 'var(--astra-primary)' : 'var(--terra-primary)');
  const houseAccent = color || (isAstra ? '#c7d2fe' : '#a7f3d0');
  const houseBg = color ? `${color}18` : (isAstra ? 'var(--astra-bg)' : 'var(--terra-bg)');
  const houseBorder = color ? `${color}35` : (isAstra ? 'var(--astra-border)' : 'var(--terra-border)');

  const sizeStyles = {
    sm: { padding: '0.2rem 0.5rem', fontSize: '0.7rem', iconSize: 12, gap: '0.3rem' },
    md: { padding: '0.3rem 0.75rem', fontSize: '0.8rem', iconSize: 14, gap: '0.4rem' },
    lg: { padding: '0.45rem 1rem', fontSize: '0.9rem', iconSize: 18, gap: '0.5rem' },
  }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyles.gap,
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: 'var(--radius-full)',
        background: variant === 'filled' ? houseColor : houseBg,
        color: variant === 'filled' ? '#ffffff' : houseAccent,
        border: `1px solid ${houseBorder}`,
        lineHeight: 1,
      }}
    >
      <Shield size={sizeStyles.iconSize} style={{ flexShrink: 0 }} />
      <span>{name}</span>
      {showSymbol && symbol && (
        <span style={{ opacity: 0.8, fontWeight: 500, textTransform: 'none' }}>
          ({symbol})
        </span>
      )}
    </span>
  );
}
