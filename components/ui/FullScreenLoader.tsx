'use client';

import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';
import { APP_NAME } from '@/lib/brand';

/**
 * Full-screen loading — matches app mesh + typography (sage / ink / hairline).
 * Hypo bounces gently with a light “working” wobble while loading.
 */
export type FullScreenLoaderProps = {
  title?: string;
  subtitle?: string;
};

export default function FullScreenLoader({
  title = 'Hang tight…',
  subtitle = 'This may take a moment.',
}: FullScreenLoaderProps) {
  return (
    <div
      className="home-mesh fixed inset-0 z-[200] flex min-h-[100dvh] flex-col items-center justify-center px-safe pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex max-w-sm flex-col items-center rounded-[1.5rem] border border-hairline/80 bg-white/80 px-8 py-10 shadow-soft backdrop-blur-md">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{APP_NAME}</p>

        <div className="relative mb-8 flex h-[7.5rem] w-[7.5rem] items-center justify-center">
          <div
            className="pointer-events-none absolute bottom-1 left-1/2 h-4 w-[4.5rem] -translate-x-1/2 rounded-full bg-sage/15 blur-md"
            aria-hidden
          />
          <motion.div
            className="relative"
            animate={{
              y: [0, -11, 0, -7, 0],
              rotate: [0, -5, 5, -3, 0],
            }}
            transition={{
              duration: 1.35,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <HypoMascot size={96} animated title="Hypo" className="drop-shadow-[0_6px_16px_rgba(91,122,101,0.18)]" />
          </motion.div>
        </div>

        <p className="text-center font-serif text-xl italic leading-snug text-ink">{title}</p>
        <p className="mt-2 max-w-[17rem] text-center text-[13px] leading-relaxed text-muted">{subtitle}</p>

        <div className="mt-8 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-sage/35"
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.92, 1.08, 0.92] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
