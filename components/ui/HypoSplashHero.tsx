'use client';

import { useState } from 'react';

/**
 * Hero del splash: usa splash-hero.png generado con Gemini 3.1 (script en repo).
 * Si el archivo no existe o falla la carga, muestra arte vectorial conceptual
 * (ritmo lento → calma matutina), sin anatomía ni clichés médicos.
 */
export default function HypoSplashHero() {
  const [useFallback, setUseFallback] = useState(false);

  if (!useFallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/splash-hero.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        onError={() => setUseFallback(true)}
      />
    );
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 390 520"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#6b7c85" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#c4b8a8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8dcc8" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a7d6a" stopOpacity="0" />
          <stop offset="50%" stopColor="#5a7d6a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5a7d6a" stopOpacity="0" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>
      <rect width="390" height="520" fill="#f5f3ef" />
      <rect width="390" height="520" fill="url(#sky)" />
      <ellipse cx="195" cy="400" rx="220" ry="140" fill="#5a7d6a" opacity="0.08" filter="url(#soft)" />
      <path
        d="M-20 320 Q 98 280 195 305 T 410 295"
        fill="none"
        stroke="url(#wave)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M-20 340 Q 120 300 195 325 T 410 318"
        fill="none"
        stroke="#5a7d6a"
        strokeOpacity="0.15"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {[0.12, 0.22, 0.35, 0.48, 0.62, 0.78].map((x, i) => (
        <circle
          key={i}
          cx={60 + i * 58}
          cy={180 + (i % 3) * 22}
          r={1.2 + (i % 2) * 0.6}
          fill="#8a9a8e"
          opacity={0.25 + (i % 3) * 0.08}
        />
      ))}
    </svg>
  );
}
