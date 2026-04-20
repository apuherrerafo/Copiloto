'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';

const MASCOT = 34;

/**
 * HypoAI: barra tipo input de chat. La mascota camina fuera del componente,
 * justo encima del borde superior (derecha → izquierda).
 */
export default function HypoNavFloat() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [walkWidth, setWalkWidth] = useState(280);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWalkWidth(Math.max(120, el.offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const edge = 10;
  const maxWalk = Math.max(48, walkWidth - MASCOT - 2 * edge);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[55] px-safe"
      style={{
        bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div ref={wrapRef} className="pointer-events-auto mx-auto max-w-lg">
        <div className="pointer-events-none relative mb-1 h-10 overflow-visible" aria-hidden>
          <motion.div
            className="absolute bottom-0"
            style={{ width: MASCOT, height: MASCOT, right: edge }}
            initial={false}
            animate={{ x: [0, -maxWalk, -maxWalk, 0, 0] }}
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

        <Link
          href="/copiloto"
          className="block rounded-[1.35rem] border border-hairline/90 bg-white px-4 py-3.5 shadow-glass transition-opacity active:opacity-90"
          aria-label="Open HypoAI chat — Ask HypoAI, write here"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sage">HypoAI</p>
          <p className="mt-0.5 font-medium text-[15px] leading-snug text-ink">Ask HypoAI</p>
          <p className="mt-1 text-[13px] leading-snug text-muted/85">Write here to chat…</p>
        </Link>
      </div>
    </div>
  );
}
