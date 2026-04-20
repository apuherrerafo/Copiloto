'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';

const MASCOT = 36;
const PAD = 4;

/**
 * HypoAI · barra clara encima del nav (con margen). Hipopótamo recorre la pista;
 * texto tipo “Ask…” como en el header anterior.
 */
export default function HypoNavFloat() {
  const walkRef = useRef<HTMLDivElement>(null);
  const [maxX, setMaxX] = useState(160);

  useEffect(() => {
    const el = walkRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setMaxX(Math.max(8, w - MASCOT - PAD * 2));
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
        /* Aire respecto al nav + FAB — no pegado */
        bottom: 'calc(5.35rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="pointer-events-auto mx-auto max-w-lg">
        <Link
          href="/copiloto"
          className="flex min-h-[52px] items-stretch overflow-hidden rounded-2xl border border-hairline/90 bg-white shadow-glass transition-opacity active:opacity-90"
          aria-label="Open HypoAI chat"
        >
          <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-2 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sage">HypoAI</p>
            <p className="truncate text-[14px] font-medium text-muted/85">Ask HypoAI for doubts or habits…</p>
          </div>

          <div
            ref={walkRef}
            className="relative w-[min(42%,9.5rem)] shrink-0 border-l border-hairline/60 bg-white"
          >
            <span
              className="pointer-events-none absolute left-1 top-1/2 z-[2] h-7 w-[2.75rem] -translate-y-1/2 rounded-lg border border-sage/20 bg-white"
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 right-0 overflow-hidden pl-8">
              <motion.div
                className="absolute top-1/2 will-change-transform"
                aria-hidden
                style={{
                  width: MASCOT,
                  height: MASCOT,
                  left: PAD,
                  marginTop: -(MASCOT / 2),
                }}
                initial={false}
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
          </div>
        </Link>
      </div>
    </div>
  );
}
