'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getProtocolSnapshot,
  getFastBreak,
  getDisplayFastElapsed,
  getFastStart,
  isEatingWindow,
} from '@/lib/protocols/julio';
import { readProtocolSettings } from '@/lib/protocols/user-protocol';
import { loadProtocolChecks } from '@/lib/protocol-checks';
import {
  CATEGORY_LABEL,
  LEARNING_PHRASES,
  pickLearningPhrase,
} from '@/lib/content/learning';

const R = 78;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ringStrokeColor(hours: number, maxH: number, targetH: number) {
  if (hours >= maxH) return 'url(#ringStrokeCoral)';
  if (hours >= targetH) return 'url(#ringStrokeAmber)';
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

function phaseFromElapsed(
  h: number,
  now: Date,
  maxH: number,
  targetH: number,
  inEatingOrPostBreakUi: boolean,
): Phase {
  if (inEatingOrPostBreakUi) {
    return {
      tag: 'eating',
      label: 'Eating window',
      quote: 'Overnight fast has not started — you are in your eating window.',
      lead: 'Everything on track. ',
    };
  }
  if (h >= maxH) {
    return {
      tag: 'over',
      label: 'Fast limit exceeded',
      quote: 'You passed the limit, eat calmly.',
      lead: 'Do not wait, break with something light.',
    };
  }
  if (h >= targetH) {
    return {
      tag: 'complete',
      label: 'Fast complete',
      quote: '“Fast complete, body at peace.”',
      lead: 'You can break the fast whenever you are ready.',
    };
  }
  const mid = Math.max(6, targetH * 0.55);
  const deep = Math.max(10, targetH * 0.75);
  if (h >= deep) {
    return {
      tag: 'burning',
      label: 'Burning fat',
      quote: `“${Math.floor(h)} hours in, you are doing great.”`,
      lead: 'Your body is burning fat.',
    };
  }
  if (h >= mid) {
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
  const [brokeFastToday, setBrokeFastToday] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const [factIndex, setFactIndex] = useState(() =>
    Math.floor(Math.random() * LEARNING_PHRASES.length),
  );

  const refresh = useCallback(() => {
    setNow(new Date());
    try {
      const c = loadProtocolChecks(new Date());
      setBrokeFastToday(c.fastBreak === true);
    } catch {
      setBrokeFastToday(false);
    }
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
    window.addEventListener('hypo-storage-sync', onRefresh);
    window.addEventListener('focus', onRefresh);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('copiloto-refresh', onRefresh);
      window.removeEventListener('hypo-storage-sync', onRefresh);
      window.removeEventListener('focus', onRefresh);
    };
  }, [refresh]);

  // Learning carousel: 5s ring → 7s fact (loop)
  useEffect(() => {
    let cancelled = false;
    const RING_MS = 5000;
    const FACT_MS = 7000;
    let showFactLocal = false;

    const loop = async () => {
      while (!cancelled) {
        const delay = showFactLocal ? FACT_MS : RING_MS;
        await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;
        showFactLocal = !showFactLocal;
        setShowFact(showFactLocal);
        if (showFactLocal) {
          setFactIndex((i) => (i + 1) % LEARNING_PHRASES.length);
        }
      }
    };
    void loop();
    return () => {
      cancelled = true;
    };
  }, []);

  const snap = getProtocolSnapshot();
  const eatEndH = snap.eatingWindowEndHour;
  const sProt = readProtocolSettings();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const inEatingOrPostBreakUi =
    isEatingWindow(now) || (brokeFastToday && nowMin < sProt.eatingWindowEndHour * 60);

  const elapsed = getDisplayFastElapsed(now, { brokeFastToday });
  const fastStart = getFastStart(now);
  const fastBreak = getFastBreak(fastStart);

  const target = snap.fast.durationHours;
  const maxH = snap.fast.maxHours;
  const phase = phaseFromElapsed(elapsed, now, maxH, target, inEatingOrPostBreakUi);

  const eatStartDt = new Date(now);
  eatStartDt.setHours(sProt.breakFastHour, 0, 0, 0);
  const eatEndDt = new Date(now);
  eatEndDt.setHours(eatEndH, 0, 0, 0);
  const totalEatingMin = Math.max(1, (eatEndDt.getTime() - eatStartDt.getTime()) / 60_000);
  const elapsedInWindowMin = (now.getTime() - eatStartDt.getTime()) / 60_000;
  const eatingRingProgress =
    phase.tag === 'eating'
      ? Math.min(1, Math.max(0, elapsedInWindowMin / totalEatingMin))
      : null;

  const progress =
    phase.tag === 'eating' && eatingRingProgress != null
      ? eatingRingProgress
      : Math.min(elapsed / target, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const stroke =
    phase.tag === 'eating' ? 'url(#ringStrokeAmber)' : ringStrokeColor(elapsed, maxH, target);

  const minsLeftEating = Math.max(
    0,
    Math.round((eatEndDt.getTime() - now.getTime()) / 60_000),
  );
  const cdH = Math.floor(minsLeftEating / 60);
  const cdM = minsLeftEating % 60;

  const displayHours = Math.floor(elapsed);
  const startLabel = isSameDay(fastStart, now) ? 'Started today' : 'Started yesterday';

  const minutesToBreak = Math.max(0, Math.round((fastBreak.getTime() - now.getTime()) / 60_000));
  const { h: remH, m: remM } = hmFromMinutes(minutesToBreak);

  let remainingLine = '';
  if (phase.tag === 'eating') {
    const minsToClose = minsLeftEating;
    const { h: ceH, m: ceM } = hmFromMinutes(minsToClose);
    remainingLine =
      minsToClose <= 0
        ? 'Eating window closes at your last-meal time — fast will count after.'
        : minsToClose > 60
          ? `Last meal / window ends in ${ceH} h ${ceM} min (then the overnight fast ring applies).`
          : `Last meal / window ends in ${minsToClose} min (then the overnight fast ring applies).`;
  } else if (phase.tag === 'complete' || phase.tag === 'over') {
    remainingLine = 'You can break the fast.';
  } else if (minutesToBreak > 60) {
    remainingLine = `You can eat in ${remH} h ${remM} min.`;
  } else {
    remainingLine = `You can eat in ${minutesToBreak} min.`;
  }

  const currentPhrase = pickLearningPhrase(factIndex);

  return (
    <section
      className="rounded-[22px] border border-white/70 bg-white/90 shadow-glass"
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
          Window {target}:{snap.eatingWindowDurationHours || 8}
        </p>
      </div>

      <div className="relative mx-auto mt-3 h-[13rem] w-[13rem]">
        {/* Static halo — no continuous animation */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle, ${
              phase.tag === 'over' || phase.tag === 'complete'
                ? 'rgba(192,144,80,0.30)'
                : phase.tag === 'eating'
                  ? 'rgba(212,176,120,0.25)'
                  : 'rgba(91,122,101,0.28)'
            } 0%, transparent 65%)`,
          }}
        />

        <svg
          viewBox="0 0 220 220"
          className="h-full w-full -rotate-90"
          style={{ opacity: showFact ? 0.15 : 1, transition: 'opacity 0.4s ease' }}
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
          </defs>
          <circle cx="110" cy="110" r={R} fill="none" stroke="#E8E5E0" strokeWidth="10" />
          <circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-[1100ms] ease-out"
          />
        </svg>

        {/* Center content: hours display OR learning fact — keep copy inside the ring short */}
        <div className="absolute inset-0 flex items-center justify-center px-4 py-3">
          <AnimatePresence mode="wait">
            {showFact ? (
              <motion.div
                key={`fact-${factIndex}`}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex max-h-[11rem] max-w-[11.5rem] flex-col items-center overflow-hidden text-center"
              >
                <span className="mb-1.5 shrink-0 rounded-full bg-sage/15 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-sage">
                  {CATEGORY_LABEL[currentPhrase.category]}
                </span>
                <p className="line-clamp-5 font-serif text-[12px] italic leading-snug text-ink sm:text-[13px]">
                  {currentPhrase.tip}
                </p>
              </motion.div>
            ) : phase.tag === 'eating' ? (
              <motion.div
                key="eating-countdown"
                initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(3px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex max-w-[10rem] flex-col items-center gap-0.5 text-center"
              >
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-sage/90">
                  Time in window
                </p>
                {minsLeftEating > 0 ? (
                  <>
                    <p className="font-serif text-[2.35rem] italic leading-none text-ink sm:text-[2.5rem]">
                      {cdH > 0 ? `${cdH}h ` : ''}
                      {cdM}m
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-muted">Until last meal</p>
                  </>
                ) : (
                  <>
                    <p className="font-serif text-xl italic leading-tight text-ink">All set</p>
                    <p className="mt-0.5 text-[10px] leading-tight text-muted">Fast ring starts after last meal</p>
                  </>
                )}
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
                <span className="mt-1 text-[11px] font-medium text-muted">of {target} hours</span>
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
    </section>
  );
}
