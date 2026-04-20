'use client';

import { motion } from 'framer-motion';
import HypoMascot from '@/components/ui/HypoMascot';

export default function LoginSplash({ name }: { name?: string }) {
  const display = name?.trim().split(/\s+/)[0] ?? '';
  return (
    <motion.div
      className="warm-splash fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.05 }}
        className="drop-shadow-[0_14px_30px_rgba(91,122,101,0.35)]"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HypoMascot size={140} animated title="HypoAI, tu copiloto" />
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="mt-7 text-[10px] font-bold uppercase tracking-[0.25em] text-sage/80"
      >
        HypoCopilot
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-1 text-center font-serif text-[1.75rem] italic leading-tight text-ink"
      >
        {display ? (
          <>Bienvenid@, <span className="text-sage">{display}</span></>
        ) : (
          <>Bienvenid@ de vuelta</>
        )}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.45 }}
        className="mt-2 text-center text-[13px] leading-snug text-muted"
      >
        Tu ritmo sigue en su sitio. Respira.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="mt-6 flex items-center gap-1.5 text-[11px] text-muted/80"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
        <span>Preparando tu día</span>
      </motion.div>
    </motion.div>
  );
}
