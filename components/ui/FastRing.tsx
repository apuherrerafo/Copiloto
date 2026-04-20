'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  EATING_WINDOW,
  PROTOCOL,
  getFastBreak,
  getFastElapsed,
  getFastStart,
  isEatingWindow,
} from '@/lib/protocols/julio';

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
      label: 'Ventana de comida',
      quote: 'Ventana activa · come limpio.',
      lead: 'Hidrata bien y prioriza proteína real.',
    };
  }
  if (h >= PROTOCOL.fast.maxHours) {
    return {
      tag: 'over',
      label: 'Límite de ayuno superado',
      quote: 'Ya pasaste el límite, come con calma.',
      lead: 'No esperes más, rompe con algo ligero.',
    };
  }
  if (h >= PROTOCOL.fast.durationHours) {
    return {
      tag: 'complete',
      label: 'Ayuno completo',
      quote: '“Ayuno cumplido, cuerpo en calma.”',
      lead: 'Ya puedes romper el ayuno cuando estés listo.',
    };
  }
  if (h >= 12) {
    return {
      tag: 'burning',
      label: 'Quemando grasa',
      quote: `“Llevas ${Math.floor(h)} horas de ayuno, vas bien.”`,
      lead: 'Tu cuerpo está quemando grasa.',
    };
  }
  if (h >= 8) {
    return {
      tag: 'glucoShift',
      label: 'Cambiando el combustible',
      quote: `“Vas bien, ${Math.floor(h)}h en calma.”`,
      lead: 'Empiezas a pasar de glucosa a grasa.',
    };
  }
  return {
    tag: 'early',
    label: 'Ayuno temprano',
    quote: `“Vamos, ${Math.floor(h)}h listas.”`,
    lead: 'Tu cuerpo va bajando insulina.',
  };
}

export default function FastRing() {
  const [now, setNow] = useState<Date>(() => new Date());

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

  const elapsed = getFastElapsed(now);
  const fastStart = getFastStart(now);
  const fastBreak = getFastBreak(fastStart);

  const target = PROTOCOL.fast.durationHours;
  const progress = Math.min(elapsed / target, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const stroke = ringStrokeColor(elapsed);
  const phase = phaseFromElapsed(elapsed, now);

  const displayHours = Math.floor(elapsed);
  const startLabel = isSameDay(fastStart, now) ? 'Empezó hoy' : 'Empezó ayer';

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
        ? `Cierra ventana en ${ceH} h ${ceM} min.`
        : `Cierra ventana en ${minsToClose} min.`;
  } else if (phase.tag === 'complete' || phase.tag === 'over') {
    remainingLine = 'Ya puedes romper el ayuno.';
  } else if (minutesToBreak > 60) {
    remainingLine = `Puedes comer en ${remH} h ${remM} min.`;
  } else {
    remainingLine = `Puedes comer en ${minutesToBreak} min.`;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[22px] border border-white/70 bg-white/80 shadow-glass backdrop-blur-sm"
      aria-label="Estado del ayuno"
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
            {phase.tag === 'eating' ? 'Ventana activa' : 'Ayuno activo'}
          </p>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted/80">
          Ventana {target}:{EATING_WINDOW.durationHours}
        </p>
      </div>

      <div className="relative mx-auto mt-3 h-[16rem] w-[16rem] sm:h-[17rem] sm:w-[17rem]">
        {(phase.tag === 'complete' || phase.tag === 'over') && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(192,144,80,0.18) 0%, rgba(196,118,99,0.08) 45%, transparent 72%)',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
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
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
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
            de {target} horas
          </span>
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
              Rompes a las
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
