'use client';

import { useId } from 'react';

/**
 * Hypo — mascota de la app: hipopótamo bebé con proporciones sanas
 * (silueta alargada, no caricatura “redonda”). Colores del design system (sage).
 */
export type HypoMascotProps = {
  /** Lado del cuadrado viewBox escalado (ej. 28 → 28×28 px) */
  size?: number;
  className?: string;
  /** Accesible cuando no es decorativo */
  title?: string;
};

export default function HypoMascot({ size = 40, className = '', title }: HypoMascotProps) {
  const id = useId().replace(/:/g, '');
  const gBody = `hypo-body-${id}`;
  const gSnout = `hypo-snout-${id}`;

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
        <linearGradient id={gBody} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7A9A82" />
          <stop offset="100%" stopColor="#5B7A65" />
        </linearGradient>
        <linearGradient id={gSnout} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9BB8A3" />
          <stop offset="100%" stopColor="#8BAD95" />
        </linearGradient>
      </defs>

      {/* Orejas pequeñas (no redondeo exagerado) */}
      <circle cx="13.5" cy="10" r="3.2" fill={`url(#${gBody})`} />
      <circle cx="34.5" cy="10" r="3.2" fill={`url(#${gBody})`} />

      {/* Cuerpo: más alto que ancho → ligero, no “gordo” */}
      <ellipse cx="24" cy="34" rx="9.5" ry="12.5" fill={`url(#${gBody})`} />

      {/* Vientre más claro (ligereza visual) */}
      <ellipse cx="24" cy="35" rx="5" ry="7" fill="#B8D0C0" opacity={0.45} />

      {/* Cabeza: proporción bebé (un poco más ancha arriba) pero ovalada vertical */}
      <ellipse cx="24" cy="15.5" rx="10" ry="11" fill={`url(#${gBody})`} />

      {/* Hocico corto, no trompa enorme */}
      <ellipse cx="24" cy="20" rx="7" ry="3.6" fill={`url(#${gSnout})`} />
      <ellipse cx="24" cy="20.2" rx="4" ry="1.9" fill="#6D8C76" opacity={0.35} />

      {/* Ojos */}
      <circle cx="19" cy="14" r="2" fill="#1F2420" />
      <circle cx="29" cy="14" r="2" fill="#1F2420" />
      <circle cx="19.5" cy="13.4" r="0.65" fill="#F7F5F3" />
      <circle cx="29.5" cy="13.4" r="0.65" fill="#F7F5F3" />

      {/* Sonrisa suave */}
      <path
        d="M19 23.5 Q24 26 29 23.5"
        fill="none"
        stroke="#4A654F"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity={0.85}
      />

      {/* Patas/minipatas */}
      <ellipse cx="17" cy="45" rx="3.5" ry="2" fill="#4A654F" />
      <ellipse cx="31" cy="45" rx="3.5" ry="2" fill="#4A654F" />

      {/* Brazitos cortos a los lados */}
      <ellipse cx="13" cy="31" rx="2.5" ry="3.5" fill="#5B7A65" transform="rotate(-12 13 31)" />
      <ellipse cx="35" cy="31" rx="2.5" ry="3.5" fill="#5B7A65" transform="rotate(12 35 31)" />
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
      <HypoMascot size={Math.round(size * 0.62)} title={title} />
    </div>
  );
}
