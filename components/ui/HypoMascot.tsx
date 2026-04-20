'use client';

import { useId } from 'react';

/**
 * HypoMascot · el hipopótamo bebé de HypoAI.
 * Personaje separado del icono de marca (pulso/ECG). Se usa en chat, login splash
 * y entradas a HypoAI. Paleta cálida (peach/lavender) sobre base fría sage del app.
 */
export type HypoMascotProps = {
  size?: number;
  className?: string;
  title?: string;
  /** Anima respiración + parpadeo (para splash / welcome). */
  animated?: boolean;
};

export default function HypoMascot({
  size = 40,
  className = '',
  title,
  animated = false,
}: HypoMascotProps) {
  const uid = useId().replace(/:/g, '');
  const bodyGrad = `hb-body-${uid}`;
  const headGrad = `hb-head-${uid}`;
  const eyeR = 3;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      role={title ? 'img' : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={bodyGrad} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#EBD2C7" />
          <stop offset="100%" stopColor="#D7B7AA" />
        </linearGradient>
        <linearGradient id={headGrad} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#F4DDD1" />
          <stop offset="100%" stopColor="#E5C5B7" />
        </linearGradient>
      </defs>

      {/* cuerpo */}
      <ellipse cx="50" cy="66" rx="30" ry="22" fill={`url(#${bodyGrad})`} />

      {/* patas */}
      <ellipse cx="33" cy="86" rx="8" ry="5" fill="#C99E8F" />
      <ellipse cx="67" cy="86" rx="8" ry="5" fill="#C99E8F" />

      {/* orejas */}
      <g>
        <ellipse cx="27" cy="26" rx="5.5" ry="4.5" fill={`url(#${headGrad})`} />
        <ellipse cx="27" cy="27" rx="2.6" ry="2" fill="#C89684" />
      </g>
      <g>
        <ellipse cx="73" cy="26" rx="5.5" ry="4.5" fill={`url(#${headGrad})`} />
        <ellipse cx="73" cy="27" rx="2.6" ry="2" fill="#C89684" />
      </g>

      {/* cabeza */}
      <ellipse cx="50" cy="40" rx="27" ry="23" fill={`url(#${headGrad})`} />

      {/* sonrojo */}
      <ellipse cx="28" cy="46" rx="4" ry="2.5" fill="#E8A99A" opacity="0.5" />
      <ellipse cx="72" cy="46" rx="4" ry="2.5" fill="#E8A99A" opacity="0.5" />

      {/* hocico */}
      <ellipse cx="50" cy="50" rx="16" ry="10.5" fill="#E8C4B5" />

      {/* fosas nasales */}
      <ellipse cx="44" cy="48" rx="1.4" ry="2.2" fill="#2A1F1A" />
      <ellipse cx="56" cy="48" rx="1.4" ry="2.2" fill="#2A1F1A" />

      {/* boca */}
      <path
        d="M45 55 Q50 58 55 55"
        stroke="#8A5D4F"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />

      {/* ojos */}
      {animated ? (
        <>
          <g>
            <ellipse cx="39" cy="33" rx={eyeR} ry={eyeR} fill="#2A1F1A">
              <animate
                attributeName="ry"
                values={`${eyeR};${eyeR};0.4;${eyeR};${eyeR}`}
                keyTimes="0;0.92;0.95;0.98;1"
                dur="4.5s"
                repeatCount="indefinite"
              />
            </ellipse>
            <circle cx="39.7" cy="32" r="0.9" fill="#FFFFFF" />
          </g>
          <g>
            <ellipse cx="61" cy="33" rx={eyeR} ry={eyeR} fill="#2A1F1A">
              <animate
                attributeName="ry"
                values={`${eyeR};${eyeR};0.4;${eyeR};${eyeR}`}
                keyTimes="0;0.92;0.95;0.98;1"
                dur="4.5s"
                repeatCount="indefinite"
              />
            </ellipse>
            <circle cx="61.7" cy="32" r="0.9" fill="#FFFFFF" />
          </g>
        </>
      ) : (
        <>
          <circle cx="39" cy="33" r={eyeR} fill="#2A1F1A" />
          <circle cx="61" cy="33" r={eyeR} fill="#2A1F1A" />
          <circle cx="39.7" cy="32" r="0.9" fill="#FFFFFF" />
          <circle cx="61.7" cy="32" r="0.9" fill="#FFFFFF" />
        </>
      )}
    </svg>
  );
}
