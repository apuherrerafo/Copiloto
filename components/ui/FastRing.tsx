'use client';

import { useEffect, useState } from 'react';
import { getFastElapsed, PROTOCOL } from '@/lib/protocols/julio';

const R = 88;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ringColor(hours: number) {
  if (hours >= PROTOCOL.fast.maxHours) return '#C47663'; // coral — over limit
  if (hours >= PROTOCOL.fast.durationHours) return '#C09050'; // amber — in buffer
  return '#5B7A65'; // sage — on track
}

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return { h, m };
}

export default function FastRing() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(getFastElapsed());
    const id = setInterval(() => setElapsed(getFastElapsed()), 60_000);
    return () => clearInterval(id);
  }, []);

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

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="100" cy="100" r={R}
            fill="none"
            stroke="#E8E5E0"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="100" cy="100" r={R}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif italic text-4xl text-ink leading-none">
            {h}<span className="text-2xl">h</span>
            {m > 0 && <span className="text-2xl ml-0.5">{m}m</span>}
          </span>
          <span className="text-xs text-gray-400 mt-1 tracking-wide">ayuno</span>
        </div>
      </div>
      <p className={`text-sm font-medium mt-1 ${
        overLimit ? 'text-coral' : atTarget ? 'text-amber' : 'text-sage'
      }`}>
        {statusLabel}
      </p>
    </div>
  );
}
