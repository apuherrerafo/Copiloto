'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';

const MASCOT = 40;
const PAD = 8;

/**
 * HypoAI · mascota fija justo encima de la barra inferior: recorre la pista en bucle
 * (caminar 4s → pausa 4s → regreso 4s → pausa 4s).
 */
export default function HypoNavFloat() {
  const walkRef = useRef<HTMLDivElement>(null);
  const [maxX, setMaxX] = useState(200);

  useEffect(() => {
    const el = walkRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setMaxX(Math.max(4, w - MASCOT - PAD * 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[55] px-safe"
      style={{
        bottom: 'calc(3.85rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="pointer-events-auto mx-auto max-w-lg">
        <div className="relative h-[48px] overflow-visible rounded-2xl border border-white/80 bg-white/80 shadow-glass backdrop-blur-md">
          {/* “Ventana” de salida */}
          <div
            className="pointer-events-none absolute left-2 top-1/2 h-9 w-11 -translate-y-1/2 rounded-xl border border-sage/25 bg-sage/[0.07]"
            aria-hidden
          />

          <Link
            href="/copiloto"
            className="absolute inset-0 z-[1] rounded-2xl"
            aria-label="Open HypoAI"
          />

          <div
            ref={walkRef}
            className="pointer-events-none absolute inset-y-0 left-12 right-28 overflow-hidden rounded-r-xl"
          >
            <motion.div
              className="absolute top-1/2 will-change-transform"
              style={{ width: MASCOT, height: MASCOT, left: PAD, marginTop: -MASCOT / 2 }}
              animate={{ x: [0, maxX, maxX, 0, 0] }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.25, 0.5, 0.75, 1],
              }}
            >
              <HypoMascot size={MASCOT} title="Hypo" />
            </motion.div>
          </div>

          <div className="pointer-events-none relative z-[2] flex h-full items-center justify-end pr-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage">HypoAI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
