'use client';

import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';

/**
 * Full-screen loading — home-mesh, bouncing Hypo only + “Loading”.
 * `title` / `subtitle` are optional hints for screen readers only.
 */
export type FullScreenLoaderProps = {
  title?: string;
  subtitle?: string;
};

export default function FullScreenLoader({
  title,
  subtitle,
}: FullScreenLoaderProps) {
  const ariaLabel = [title, subtitle].filter(Boolean).join('. ') || 'Loading';

  return (
    <div
      className="home-mesh fixed inset-0 z-[200] flex min-h-[100dvh] flex-col items-center justify-center px-safe pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="relative flex flex-col items-center">
        <div
          className="pointer-events-none absolute bottom-2 left-1/2 h-5 w-[5.5rem] -translate-x-1/2 rounded-full bg-sage/12 blur-md"
          aria-hidden
        />
        <motion.div
          className="relative"
          animate={{
            y: [0, -14, 0, -9, 0],
            rotate: [0, -6, 6, -4, 0],
          }}
          transition={{
            duration: 1.25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <HypoMascot size={112} animated />
        </motion.div>
        <p className="mt-8 text-[15px] font-semibold tracking-wide text-ink">Loading</p>
      </div>
    </div>
  );
}
