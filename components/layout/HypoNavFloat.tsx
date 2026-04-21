'use client';

import Link from 'next/link';
import HypoWalkStrip from '@/components/ui/HypoWalkStrip';

/** One step down from full “×3” (102); 86px keeps presence without crowding */
const MASCOT = 86;

/**
 * HypoAI: barra tipo input de chat. La mascota camina fuera del componente,
 * justo encima del borde superior (derecha → izquierda).
 */
export default function HypoNavFloat() {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[55] px-safe"
      style={{
        bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/*
        Solo el Link debe ser pointer-events-auto: si el contenedor padre lo es, toda la banda max-w-lg
        roba taps a botones que quedan detrás (p. ej. Save en /registrar).
      */}
      <div className="pointer-events-none mx-auto max-w-lg">
        <HypoWalkStrip
          mascotSize={MASCOT}
          edgeInset={10}
          duration={16}
          direction="rtl"
          className="relative mb-1"
        />

        <Link
          href="/copiloto"
          className="pointer-events-auto block rounded-[1.35rem] border border-ink/12 bg-[#CEC6BA] px-4 py-2.5 shadow-soft ring-1 ring-ink/[0.04] motion-reduce:animate-none motion-reduce:shadow-soft animate-hypo-invite-pulse transition-[transform,opacity] duration-150 ease-out will-change-[filter,box-shadow] active:scale-[0.97] active:opacity-95 motion-safe:active:animate-none motion-safe:active:brightness-[0.97] motion-safe:active:shadow-soft"
          aria-label="Open HypoAI — Ask HypoAI any curiosity you have"
        >
          <p className="text-[13px] font-medium leading-snug text-ink/90">
            Ask HypoAI any curiosity you have…
          </p>
        </Link>
      </div>
    </div>
  );
}
