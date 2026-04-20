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
      <div className="relative flex h-[200px] w-[200px] items-center justify-center">
        {/* Anillo exterior: sweep sage girando (loader) */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        >
          <defs>
            <linearGradient id="splashArcA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5B7A65" stopOpacity="0" />
              <stop offset="60%" stopColor="#5B7A65" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9BB8A3" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#5B7A65"
            strokeOpacity="0.12"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#splashArcA)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="70 210"
          />
        </motion.svg>

        {/* Anillo interior: gira en sentido contrario, más rápido */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-[18px] h-[calc(100%-36px)] w-[calc(100%-36px)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#C47663"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="30 230"
          />
        </motion.svg>

        {/* Puntos orbitales pequeños */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        >
          <span className="absolute left-1/2 top-1 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-sage shadow-[0_0_8px_rgba(91,122,101,0.75)]" />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-amber/80" />
        </motion.div>

        {/* Mascota centrada, respirando */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.05 }}
          className="relative drop-shadow-[0_14px_30px_rgba(91,122,101,0.35)]"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HypoMascot size={124} animated title="HypoAI" />
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-sage/80"
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
          <>
            Bienvenid@, <span className="text-sage">{display}</span>
          </>
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
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-sage"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span>Preparando tu día</span>
      </motion.div>
    </motion.div>
  );
}
