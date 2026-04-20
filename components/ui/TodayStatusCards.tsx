'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getLogsByDate } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';
import { getFastElapsed, PROTOCOL } from '@/lib/protocols/julio';

const HYD_TARGET_L = 2.0;
const HYD_CUP_ML = 250;

function hydKey(date = new Date()) {
  return `copiloto_hydration_${localDateISO(date)}`;
}

function loadCups(date = new Date()): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(hydKey(date));
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

function saveCups(cups: number, date = new Date()) {
  try {
    localStorage.setItem(hydKey(date), String(Math.max(0, cups)));
  } catch {
    /* ignore */
  }
}

function formatHM(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

type StatusTone = 'ok' | 'pending' | 'progress';

function StatusDot({ tone }: { tone: StatusTone }) {
  if (tone === 'ok') {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-white shadow-soft"
        aria-label="Hecho"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (tone === 'pending') {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" aria-label="Pendiente" />;
  }
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber animate-pulse" aria-label="En curso" />;
}

export default function TodayStatusCards() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [pillTakenAt, setPillTakenAt] = useState<string | null>(null);
  const [cups, setCups] = useState<number>(0);

  const refresh = useCallback(async () => {
    const n = new Date();
    setNow(n);
    setCups(loadCups(n));
    try {
      const logs = await getLogsByDate(localDateISO(n));
      const pill = logs.find(
        (l) => l.type === 'medication' && /levotir/i.test(l.label ?? ''),
      );
      if (pill) {
        const d = new Date(pill.timestamp);
        setPillTakenAt(formatHM(d));
      } else {
        setPillTakenAt(null);
      }
    } catch {
      setPillTakenAt(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onRefresh = () => refresh();
    window.addEventListener('copiloto-refresh', onRefresh);
    window.addEventListener('focus', onRefresh);
    const tick = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener('copiloto-refresh', onRefresh);
      window.removeEventListener('focus', onRefresh);
      clearInterval(tick);
    };
  }, [refresh]);

  const hydL = (cups * HYD_CUP_ML) / 1000;
  const hydRemainingL = Math.max(0, HYD_TARGET_L - hydL);

  const pillTone: StatusTone = pillTakenAt ? 'ok' : 'pending';
  const pillTitle = pillTakenAt ? 'Tomada' : 'Pendiente';
  const pillHint = pillTakenAt ? `A las ${pillTakenAt}` : `${PROTOCOL.levothyroxine.time}`;

  const hydTone: StatusTone = hydRemainingL === 0 ? 'ok' : hydL > 0 ? 'progress' : 'pending';
  const hydTitle = `${hydL.toFixed(1)} L`;
  const hydHint =
    hydRemainingL === 0 ? 'Meta cumplida' : `Faltan ${hydRemainingL.toFixed(1)} L`;

  const elapsed = getFastElapsed(now);
  const inKetosis = elapsed >= 12 && elapsed < PROTOCOL.fast.maxHours;
  const ketoTone: StatusTone = inKetosis ? 'ok' : 'pending';
  const ketoTitle = inKetosis ? 'Activa' : 'Próxima';
  const ketoHint = inKetosis
    ? 'Buen ritmo'
    : elapsed >= 8
      ? `En ~${Math.max(0, Math.ceil(12 - elapsed))} h`
      : 'Después de 12 h';

  const addCup = () => {
    const next = Math.min(20, cups + 1);
    setCups(next);
    saveCups(next);
  };

  const resetCups = () => {
    setCups(0);
    saveCups(0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
      aria-label="Estado de hoy"
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Hoy</p>

      <div className="grid grid-cols-3 gap-2">
        {/* Medicación */}
        <div className="relative rounded-[18px] border border-hairline/70 bg-white/90 p-3 shadow-soft">
          <div className="absolute right-2.5 top-2.5">
            <StatusDot tone={pillTone} />
          </div>
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-sage/12 text-sage">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5.5 12a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
              <path d="M7.8 9.7l8.4 4.6" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold leading-tight text-ink">{pillTitle}</p>
          <p className="truncate text-[11px] leading-tight text-muted">Levotiroxina</p>
          <p className="mt-0.5 text-[10px] leading-tight text-muted/80">{pillHint}</p>
        </div>

        {/* Hidratación */}
        <button
          onClick={addCup}
          onDoubleClick={resetCups}
          className="relative rounded-[18px] border border-hairline/70 bg-white/90 p-3 text-left shadow-soft transition-transform active:scale-[0.98]"
          aria-label="Sumar 250 ml de agua"
        >
          <div className="absolute right-2.5 top-2.5">
            <StatusDot tone={hydTone} />
          </div>
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber/15 text-amber">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3s-6 6.5-6 11a6 6 0 1012 0c0-4.5-6-11-6-11z" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold leading-tight text-ink">{hydTitle}</p>
          <p className="truncate text-[11px] leading-tight text-muted">Hidratación</p>
          <p className="mt-0.5 text-[10px] leading-tight text-muted/80">{hydHint}</p>
        </button>

        {/* Cetosis */}
        <div className="relative rounded-[18px] border border-hairline/70 bg-white/90 p-3 shadow-soft">
          <div className="absolute right-2.5 top-2.5">
            <StatusDot tone={ketoTone} />
          </div>
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-coral/15 text-coral">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3c-2 3-5 5.2-5 9a5 5 0 0010 0c0-3.8-3-6-5-9z" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold leading-tight text-ink">{ketoTitle}</p>
          <p className="truncate text-[11px] leading-tight text-muted">Cetosis</p>
          <p className="mt-0.5 text-[10px] leading-tight text-muted/80">{ketoHint}</p>
        </div>
      </div>
    </motion.section>
  );
}
