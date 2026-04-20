'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getFastElapsed, PROTOCOL } from '@/lib/protocols/julio';
import { loadProtocolChecks } from '@/lib/protocol-checks';

const R = 88;
const CIRCUMFERENCE = 2 * Math.PI * R;

const MILESTONES: { key: string; short: string }[] = [
  { key: 'pill', short: 'Levo' },
  { key: 'fastBreak', short: 'Romper' },
  { key: 'walkLunch', short: 'Caminar' },
  { key: 'lastMeal', short: 'Cena' },
  { key: 'walkDinner', short: 'Paseo' },
];

function ringStrokeColor(hours: number) {
  if (hours >= PROTOCOL.fast.maxHours) return 'url(#ringStrokeCoral)';
  if (hours >= PROTOCOL.fast.durationHours) return 'url(#ringStrokeAmber)';
  return 'url(#ringStrokeSage)';
}

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return { h, m };
}

export default function FastRing() {
  const [elapsed, setElapsed] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const refresh = useCallback(() => {
    setElapsed(getFastElapsed());
    setChecks(loadProtocolChecks());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const onRefresh = () => refresh();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('copiloto-refresh', onRefresh);
    window.addEventListener('focus', onRefresh);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('copiloto-refresh', onRefresh);
      window.removeEventListener('focus', onRefresh);
    };
  }, [refresh]);

  const target = PROTOCOL.fast.durationHours;
  const max = PROTOCOL.fast.maxHours;
  const progress = Math.min(elapsed / target, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const stroke = ringStrokeColor(elapsed);
  const { h, m } = formatDuration(elapsed);

  const overLimit = elapsed >= max;
  const atTarget = elapsed >= target && elapsed < max;
  const statusLabel = overLimit
    ? 'Límite superado'
    : atTarget
      ? 'Ayuno completo'
      : `Meta: ${target}h`;

  const doneCount = MILESTONES.filter((s) => checks[s.key]).length;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-[13.5rem] w-[13.5rem] sm:h-60 sm:w-60">
        {(atTarget || overLimit) && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(91,122,101,0.18) 0%, rgba(192,144,80,0.08) 40%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id="ringStrokeSage" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9BB8A3" />
              <stop offset="100%" stopColor="#5B7A65" />
            </linearGradient>
            <linearGradient id="ringStrokeAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4B078" />
              <stop offset="100%" stopColor="#C09050" />
            </linearGradient>
            <linearGradient id="ringStrokeCoral" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4988A" />
              <stop offset="100%" stopColor="#C47663" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#E8E5E0" strokeWidth="11" />
          <motion.circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <motion.span
            className="font-serif text-4xl italic leading-none text-ink"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {h}
            <span className="text-2xl not-italic">h</span>
            {m > 0 && <span className="text-2xl not-italic ml-0.5">{m}m</span>}
          </motion.span>
          <span className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted/80">
            ayuno
          </span>
          <p className="mt-2 font-serif text-xs italic leading-snug text-muted">
            Pequeños pasos, metabolismo en calma.
          </p>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.35 }}
        className={`mt-2 text-sm font-semibold ${
          overLimit ? 'text-coral' : atTarget ? 'text-amber' : 'text-sage'
        }`}
      >
        {statusLabel}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-muted"
      >
        Total completado
      </motion.p>

      <motion.div
        className="mt-1.5 flex max-w-[260px] flex-wrap justify-center gap-1.5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.48 } },
        }}
      >
        {MILESTONES.map((s) => {
          const on = !!checks[s.key];
          return (
            <motion.span
              key={s.key}
              variants={{
                hidden: { opacity: 0, scale: 0.82 },
                show: { opacity: 1, scale: 1, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.32 } },
              }}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                on ? 'border-sage/40 bg-sage/12 text-sage' : 'border-hairline/80 bg-white/60 text-muted backdrop-blur-sm'
              }`}
            >
              {s.short}
              {on ? ' ✓' : ''}
            </motion.span>
          );
        })}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.82 }}
        className="mt-2 max-w-xs text-center text-[10px] font-medium text-muted"
      >
        {doneCount}/{MILESTONES.length} del protocolo hoy
      </motion.p>
    </motion.div>
  );
}
