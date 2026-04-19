'use client';

import { useEffect, useState } from 'react';
import { getTodaySchedule } from '@/lib/protocols/julio';

type Event = ReturnType<typeof getTodaySchedule>[number];

function isPast(time: string): boolean {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

function isCurrent(time: string, nextTime?: string): boolean {
  if (!nextTime) return isPast(time);
  return isPast(time) && !isPast(nextTime);
}

const ICONS: Record<string, string> = {
  medication: '💊',
  meal: '🍽️',
};

const STORAGE_KEY = 'copiloto_checked_';

function todayKey() {
  return STORAGE_KEY + new Date().toISOString().slice(0, 10);
}

export default function ProtocolTimeline() {
  const events = getTodaySchedule();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(todayKey());
      if (stored) setChecked(JSON.parse(stored));
    } catch {}
  }, []);

  function toggle(key: string) {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    try { localStorage.setItem(todayKey(), JSON.stringify(next)); } catch {}
  }

  return (
    <div className="space-y-2">
      {events.map((ev: Event, i: number) => {
        const past = isPast(ev.time);
        const current = isCurrent(ev.time, events[i + 1]?.time);
        const done = !!checked[ev.key];

        return (
          <button
            key={ev.key}
            onClick={() => toggle(ev.key)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all text-left ${
              done
                ? 'bg-sage/10 border-sage/30'
                : current
                ? 'bg-surface border-sage shadow-sm'
                : 'bg-surface border-gray-100'
            }`}
          >
            {/* Time */}
            <span className={`text-sm font-medium w-12 shrink-0 ${
              current ? 'text-sage' : past ? 'text-gray-400' : 'text-gray-300'
            }`}>
              {ev.time}
            </span>

            {/* Icon */}
            <span className="text-lg w-7 shrink-0 text-center">
              {ICONS[ev.type]}
            </span>

            {/* Label */}
            <span className={`flex-1 text-sm font-medium ${
              done ? 'text-sage line-through' : current ? 'text-ink' : 'text-gray-400'
            }`}>
              {ev.label}
            </span>

            {/* Check */}
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              done ? 'bg-sage border-sage' : 'border-gray-200'
            }`}>
              {done && (
                <svg viewBox="0 0 10 10" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="1.8" fill="none">
                  <path d="M1.5 5L4 7.5L8.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
