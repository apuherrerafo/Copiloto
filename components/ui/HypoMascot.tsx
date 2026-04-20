'use client';

import { useId } from 'react';

/**
 * Icono de marca HypoCopilot: ritmo / equilibrio metabólico (línea tipo ECG en marco redondeado).
 * Diseño abstracto — sin figura humana ni animal — para no asociar la app con estigmas corporales.
 */
export type HypoMascotProps = {
  /** Lado del cuadrado viewBox escalado (ej. 28 → 28×28 px) */
  size?: number;
  className?: string;
  /** Accesible cuando no es decorativo */
  title?: string;
};

export default function HypoMascot({ size = 40, className = '', title }: HypoMascotProps) {
  const gid = useId().replace(/:/g, '');
  const gradId = `hypo-brand-${gid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7A9A82" />
          <stop offset="100%" stopColor="#5B7A65" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="11" fill={`url(#${gradId})`} />
      <path
        d="M11 24h4l2-7 5 15 4-20 4 13h7"
        fill="none"
        stroke="#F7F5F3"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />
    </svg>
  );
}

/** Variante en círculo (para avatares en UI) */
export function HypoMascotBubble({
  size = 40,
  className = '',
  title,
}: HypoMascotProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-sage/12 ring-1 ring-sage/15 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <HypoMascot size={Math.round(size * 0.72)} title={title} />
    </div>
  );
}
