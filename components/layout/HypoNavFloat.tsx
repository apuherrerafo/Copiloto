'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';

/** Base size was 34px; ×3 for clearer mascot above the chat strip */
const MASCOT = 102;

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
        <div
          className="pointer-events-none relative mb-1 overflow-visible"
          style={{ height: MASCOT }}
          aria-hidden
        >
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
          className="block rounded-[1.35rem] border border-hairline/90 bg-white px-4 py-2.5 shadow-glass transition-opacity active:opacity-90"
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
