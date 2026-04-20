'use client';

import { useCallback, useEffect, useState } from 'react';
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

function ringColor(hours: number) {
  if (hours >= PROTOCOL.fast.maxHours) return '#C47663';
  if (hours >= PROTOCOL.fast.durationHours) return '#C09050';
  return '#5B7A65';
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
  const color = ringColor(elapsed);
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
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="#E8E5E0" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif italic text-4xl text-ink leading-none">
            {h}
            <span className="text-2xl">h</span>
            {m > 0 && (
              <span className="text-2xl ml-0.5">
                {m}m
              </span>
            )}
          </span>
          <span className="text-xs text-muted mt-1 tracking-wide">ayuno</span>
        </div>
      </div>
      <p
        className={`text-sm font-medium mt-1 ${
          overLimit ? 'text-coral' : atTarget ? 'text-amber' : 'text-sage'
        }`}
      >
        {statusLabel}
      </p>
      <div className="flex gap-2 mt-3 justify-center flex-wrap max-w-[220px]">
        {MILESTONES.map((s) => {
          const on = !!checks[s.key];
          return (
            <span
              key={s.key}
              className={`text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors ${
                on ? 'bg-sage/15 border-sage/40 text-sage' : 'bg-surface border-hairline text-muted'
              }`}
            >
              {s.short}
              {on ? ' ✓' : ''}
            </span>
          );
        })}
      </div>
      {doneCount > 0 && (
        <p className="text-[10px] text-muted mt-2 text-center max-w-xs">
          Protocolo: {doneCount}/{MILESTONES.length} marcados hoy · el anillo sigue el reloj (última comida 20:00)
        </p>
      )}
    </div>
  );
}
