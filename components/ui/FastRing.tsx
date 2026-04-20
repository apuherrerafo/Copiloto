'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  EATING_WINDOW,
  PROTOCOL,
  getFastBreak,
  getFastElapsed,
  getFastStart,
  isEatingWindow,
} from '@/lib/protocols/julio';
import {
  CATEGORY_LABEL,
  LEARNING_PHRASES,
  pickLearningPhrase,
} from '@/lib/content/learning';

const R = 96;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ringStrokeColor(hours: number) {
  if (hours >= PROTOCOL.fast.maxHours) return 'url(#ringStrokeCoral)';
  if (hours >= PROTOCOL.fast.durationHours) return 'url(#ringStrokeAmber)';
  return 'url(#ringStrokeSage)';
}

function hmFromMinutes(totalMin: number) {
  const h = Math.floor(totalMin / 60);
  const m = Math.max(0, Math.round(totalMin - h * 60));
  return { h, m };
}

function formatHM(date: Date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Phase = {
  tag: 'early' | 'glucoShift' | 'burning' | 'complete' | 'over' | 'eating';
  label: string;
  quote: string;
  lead: string;
};

function phaseFromElapsed(h: number, now: Date): Phase {
  if (isEatingWindow(now)) {
    return {
      tag: 'eating',
      label: 'Eating window',
      quote: 'Eating window open · eat clean.',
      lead: 'Hydrate well and prioritize real protein.',
    };
  }
  if (h >= PROTOCOL.fast.maxHours) {
    return {
      tag: 'over',
      label: 'Fast limit exceeded',
      quote: 'You passed the limit, eat calmly.',
      lead: 'Do not wait, break with something light.',
    };
  }
  if (h >= PROTOCOL.fast.durationHours) {
    return {
      tag: 'complete',
      label: 'Fast complete',
      quote: '“Fast complete, body at peace.”',
      lead: 'You can break the fast whenever you are ready.',
    };
  }
  if (h >= 12) {
    return {
      tag: 'burning',
      label: 'Burning fat',
      quote: `“${Math.floor(h)} hours in, you are doing great.”`,
      lead: 'Your body is burning fat.',
    };
  }
  if (h >= 8) {
    return {
      tag: 'glucoShift',
      label: 'Switching fuel',
      quote: `“Nice pace, ${Math.floor(h)}h steady.”`,
      lead: 'You are shifting from glucose to fat.',
    };
  }
  return {
    tag: 'early',
    label: 'Early fast',
    quote: `“Keep going, ${Math.floor(h)}h locked in.”`,
    lead: 'Your insulin is coming down.',
  };
}

export default function FastRing() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [showFact, setShowFact] = useState(false);
  const [factIndex, setFactIndex] = useState(() =>
    Math.floor(Math.random() * LEARNING_PHRASES.length),
  );

  const refresh = useCallback(() => setNow(new Date()), []);

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

  // Learning carousel: 3.5s ring → 3.5s fact → ring → fact…
  useEffect(() => {
    const tick = () => {
      setShowFact((prev) => {
        if (!prev) {
          setFactIndex((i) => (i + 1) % LEARNING_PHRASES.length);
        }
        return !prev;
      });
    };
    const id = setInterval(tick, 3500);
    return () => clearInterval(id);
  }, []);

  const elapsed = getFastElapsed(now);
  const fastStart = getFastStart(now);
  const fastBreak = getFastBreak(fastStart);

  const target = PROTOCOL.fast.durationHours;
  const progress = Math.min(elapsed / target, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const stroke = ringStrokeColor(elapsed);
  const phase = phaseFromElapsed(elapsed, now);

  const displayHours = Math.floor(elapsed);
  const startLabel = isSameDay(fastStart, now) ? 'Started today' : 'Started yesterday';

  const minutesToBreak = Math.max(0, Math.round((fastBreak.getTime() - now.getTime()) / 60_000));
  const { h: remH, m: remM } = hmFromMinutes(minutesToBreak);

  let remainingLine = '';
  if (phase.tag === 'eating') {
    const eatingEnd = new Date(now);
    eatingEnd.setHours(20, 0, 0, 0);
    const minsToClose = Math.max(0, Math.round((eatingEnd.getTime() - now.getTime()) / 60_000));
    const { h: ceH, m: ceM } = hmFromMinutes(minsToClose);
    remainingLine =
      minsToClose > 60
        ? `Window closes in ${ceH} h ${ceM} min.`
        : `Window closes in ${minsToClose} min.`;
  } else if (phase.tag === 'complete' || phase.tag === 'over') {
    remainingLine = 'You can break the fast.';
  } else if (minutesToBreak > 60) {
    remainingLine = `You can eat in ${remH} h ${remM} min.`;
  } else {
    remainingLine = `You can eat in ${minutesToBreak} min.`;
  }

  const currentPhrase = pickLearningPhrase(factIndex);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[22px] border border-white/70 bg-white/80 shadow-glass backdrop-blur-sm"
      aria-label="Fast status"
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              phase.tag === 'over'
                ? 'bg-coral'
                : phase.tag === 'complete'
                  ? 'bg-amber'
                  : phase.tag === 'eating'
                    ? 'bg-amber'
                    : 'bg-sage animate-pulse'
            }`}
          />
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {phase.tag === 'eating' ? 'Eating window' : 'Fast in progress'}
          </p>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted/80">
          Window {target}:{EATING_WINDOW.durationHours}
        </p>
      </div>

      <div className="relative mx-auto mt-3 h-[16rem] w-[16rem] sm:h-[17rem] sm:w-[17rem]">
        {(() => {
          const halo =
            phase.tag === 'over' || phase.tag === 'complete'
              ? 'rgba(192,144,80,0.24)'
              : phase.tag === 'eating'
                ? 'rgba(212,176,120,0.20)'
                : 'rgba(91,122,101,0.24)';
          return (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${halo} 0%, transparent 62%)`,
              }}
              animate={{
                scale: [1, 1.07, 1.02, 1.1, 1],
                opacity: [0.55, 1, 0.7, 1, 0.55],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.12, 0.28, 0.42, 1],
              }}
            />
          );
        })()}

        <motion.svg
          viewBox="0 0 220 220"
          className="h-full w-full -rotate-90"
          animate={{ opacity: showFact ? 0.15 : 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <defs>
            <linearGradient id="ringStrokeSage" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B6DCBF" />
              <stop offset="45%" stopColor="#6FA07C" />
              <stop offset="100%" stopColor="#3E6A51" />
            </linearGradient>
            <linearGradient id="ringStrokeAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EAC78B" />
              <stop offset="50%" stopColor="#C99154" />
              <stop offset="100%" stopColor="#8F5F2A" />
            </linearGradient>
            <linearGradient id="ringStrokeCoral" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E6A89A" />
              <stop offset="50%" stopColor="#C47663" />
              <stop offset="100%" stopColor="#8F4638" />
            </linearGradient>
            <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur">
                <animate
                  attributeName="stdDeviation"
                  values="3;11;4;13;3"
                  keyTimes="0;0.12;0.28;0.42;1"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              </feGaussianBlur>
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="110" cy="110" r={R} fill="none" stroke="#E8E5E0" strokeWidth="10" />
          <motion.circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            filter="url(#ringGlow)"
            initial={{ strokeDashoffset: CIRCUMFERENCE, opacity: 0.8 }}
            animate={{
              strokeDashoffset: dashOffset,
              opacity: [0.7, 1, 0.82, 1, 0.7],
            }}
            transition={{
              strokeDashoffset: { duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
              opacity: {
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.12, 0.28, 0.42, 1],
              },
            }}
          />
        </motion.svg>

        {/* Center content: hours display OR learning fact */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">
            {showFact ? (
              <motion.div
                key={`fact-${factIndex}`}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <span className="mb-2 rounded-full bg-sage/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-sage">
                  {CATEGORY_LABEL[currentPhrase.category]}
                </span>
                <p className="font-serif text-[13.5px] italic leading-snug text-ink sm:text-[14.5px]">
                  {currentPhrase.tip}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="hours"
                initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(3px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <motion.span
                  key={displayHours}
                  className="font-serif text-[5.5rem] italic leading-none text-ink"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {displayHours}
                </motion.span>
                <span className="mt-1 text-[11px] font-medium text-muted">
                  of {target} hours
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-5 pt-1 pb-4">
        <p className="text-center font-serif text-[15px] italic leading-snug text-ink">
          {phase.quote}
        </p>
        <p className="mt-2 text-center text-[13px] leading-snug text-muted">
          {phase.lead}{' '}
          <span className="font-semibold text-ink/90">{remainingLine}</span>
        </p>

        <div className="my-4 h-px w-full bg-hairline/80" />

        <div className="flex items-start justify-between gap-4 text-left">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {startLabel}
            </p>
            <p className="mt-0.5 font-serif text-xl italic text-ink">
              {formatHM(fastStart)}
            </p>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Break at
            </p>
            <p className="mt-0.5 font-serif text-xl italic text-ink">
              {formatHM(fastBreak)}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
