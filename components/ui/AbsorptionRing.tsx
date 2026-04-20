'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getAbsorptionWindowEndMs,
  getLastLevothyroxineTimestampForDay,
  LEVO_ABSORPTION_MINUTES,
} from '@/lib/protocols/absorption';
import { getLogsByDate } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';

const R = 72;
const CIRC = 2 * Math.PI * R;

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return '0:00';
  const totalSec = Math.ceil(msRemaining / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AbsorptionRing() {
  const today = localDateISO();
  const [now, setNow] = useState(() => new Date());
  const [levoAt, setLevoAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    const logs = await getLogsByDate(today);
    setLevoAt(getLastLevothyroxineTimestampForDay(logs, today));
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    const onRefresh = () => void load();
    window.addEventListener('copiloto-refresh', onRefresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('copiloto-refresh', onRefresh);
    };
  }, [load]);

  const endMs = levoAt != null ? getAbsorptionWindowEndMs(levoAt) : null;
  const remaining = endMs != null ? endMs - now.getTime() : 0;
  const inWindow = levoAt != null && remaining > 0;
  const progress =
    levoAt != null && endMs != null
      ? Math.min(1, Math.max(0, (now.getTime() - levoAt) / (endMs - levoAt)))
      : 0;
  const dashOffset = CIRC * (1 - progress);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-4 rounded-[22px] border border-white/70 bg-white/75 shadow-glass backdrop-blur-sm"
      aria-label="Levothyroxine absorption window"
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              inWindow ? 'animate-pulse bg-amber' : levoAt ? 'bg-sage' : 'bg-muted/50'
            }`}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Pill absorption
          </p>
        </div>
        <p className="text-[10px] font-semibold text-muted/90">{LEVO_ABSORPTION_MINUTES} min window</p>
      </div>

      <div className="flex flex-col items-center px-4 pb-4 pt-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative h-[11rem] w-[11rem] shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180" aria-hidden>
            <defs>
              <linearGradient id="absRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B7A65" />
                <stop offset="100%" stopColor="#C4A574" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
            <circle
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke="url(#absRingGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={levoAt ? dashOffset : CIRC}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {inWindow ? (
              <>
                <p className="font-mono text-3xl font-semibold tabular-nums text-ink">
                  {formatCountdown(remaining)}
                </p>
                <p className="mt-1 max-w-[9rem] text-[11px] leading-snug text-muted">
                  Wait before coffee, food, or supplements that affect absorption.
                </p>
              </>
            ) : levoAt ? (
              <>
                <p className="text-lg font-semibold text-sage">Clear</p>
                <p className="mt-1 max-w-[9rem] text-[11px] leading-snug text-muted">
                  Absorption window complete. Coffee and meals are OK per your protocol.
                </p>
              </>
            ) : (
              <>
                <p className="max-w-[10rem] text-[12px] font-medium leading-snug text-ink">
                  Log levothyroxine when you take it
                </p>
                <p className="mt-1 max-w-[9rem] text-[11px] leading-snug text-muted">
                  A {LEVO_ABSORPTION_MINUTES}-minute timer starts from your log time.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 w-full max-w-sm flex-1 text-center sm:mt-0 sm:text-left">
          {levoAt && (
            <p className="text-xs text-muted">
              Last logged:{' '}
              {new Date(levoAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </p>
          )}
          <Link
            href="/registrar"
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-sage/30 bg-sage/10 py-2.5 text-sm font-semibold text-sage transition-colors hover:bg-sage/15 sm:w-auto sm:px-5"
          >
            {levoAt ? 'Update log' : 'Log medication'}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
