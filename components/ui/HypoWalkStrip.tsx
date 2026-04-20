'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';

type Props = {
  mascotSize?: number;
  /** Inset from left/right where the walk starts */
  edgeInset?: number;
  duration?: number;
  className?: string;
  /** ltr = left → right (sign-in strip); rtl = right → left (HypoAI float) */
  direction?: 'ltr' | 'rtl';
};

/**
 * Baby Hypo walks along a horizontal track (pointer-events none).
 */
export default function HypoWalkStrip({
  mascotSize = 72,
  edgeInset = 12,
  duration = 14,
  className = '',
  direction = 'ltr',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [walkWidth, setWalkWidth] = useState(320);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWalkWidth(Math.max(120, el.offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxWalk = Math.max(48, walkWidth - mascotSize - 2 * edgeInset);
  const isLtr = direction === 'ltr';
  const xKeyframes = isLtr ? [0, maxWalk, maxWalk, 0, 0] : [0, -maxWalk, -maxWalk, 0, 0];

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: mascotSize }}
      aria-hidden
    >
      <motion.div
        className="absolute bottom-0"
        style={{
          width: mascotSize,
          height: mascotSize,
          ...(isLtr ? { left: edgeInset } : { right: edgeInset }),
        }}
        initial={false}
        animate={{ x: xKeyframes }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      >
        <div className="relative h-full w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[8%] left-1/2 h-[38%] w-[95%] max-w-[7.5rem] -translate-x-1/2 rounded-[50%] opacity-[0.75] blur-[14px]"
            style={{
              background:
                'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(91, 122, 101, 0.42) 0%, rgba(255, 178, 132, 0.2) 42%, transparent 72%)',
            }}
          />
          <HypoMascot
            size={mascotSize}
            className="relative z-[1] drop-shadow-[0_12px_24px_rgba(91,122,101,0.32)]"
          />
        </div>
      </motion.div>
    </div>
  );
}
