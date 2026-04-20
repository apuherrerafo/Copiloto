'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getTodaySchedule } from '@/lib/protocols/julio';
import { protocolCheckStorageKey } from '@/lib/protocol-checks';
import { playUiSound } from '@/lib/sounds';
import { scheduleProtocolPush } from '@/lib/sync/protocol-push';

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
  activity: '🚶',
};

export default function ProtocolTimeline() {
  const events = getTodaySchedule();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function loadChecked() {
    try {
      const stored = localStorage.getItem(protocolCheckStorageKey());
      if (stored) setChecked(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadChecked();
    const onRefresh = () => loadChecked();
    window.addEventListener('copiloto-refresh', onRefresh);
    return () => window.removeEventListener('copiloto-refresh', onRefresh);
  }, []);

  function toggle(key: string) {
    const turningOn = !checked[key];
    playUiSound(turningOn ? 'celebrate' : 'tap');
    const next = { ...checked, [key]: turningOn };
    setChecked(next);
    try {
      localStorage.setItem(protocolCheckStorageKey(), JSON.stringify(next));
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('copiloto-refresh'));
      scheduleProtocolPush();
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-white/60 bg-white/70 p-5 shadow-lift backdrop-blur-md">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Today</p>
          <h2 className="font-serif text-xl italic text-ink">Day plan</h2>
        </div>
        <Link
          href="/registrar"
          className="shrink-0 rounded-full border border-sage/25 bg-sage/10 px-3 py-1.5 text-xs font-semibold text-sage transition-colors hover:bg-sage/15"
        >
          Log
        </Link>
      </div>

      <motion.div
        className="space-y-2.5"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {events.map((ev: Event, i: number) => {
          const past = isPast(ev.time);
          const current = isCurrent(ev.time, events[i + 1]?.time);
          const done = !!checked[ev.key];

          return (
            <motion.button
              key={ev.key}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.42 } },
              }}
              onClick={() => toggle(ev.key)}
              className={`flex w-full items-center gap-3 rounded-3xl border px-3.5 py-3.5 text-left shadow-soft transition-all active:scale-[0.99] ${
                done
                  ? 'border-sage/30 bg-sage/10'
                  : current
                    ? 'border-sage/40 bg-white shadow-lift'
                    : 'border-hairline/80 bg-white/90'
              }`}
            >
              <span
                className={`flex w-11 shrink-0 justify-center font-mono text-sm font-semibold ${
                  current ? 'text-sage' : past ? 'text-muted' : 'text-muted/25'
                }`}
              >
                {ev.time}
              </span>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background text-lg ring-1 ring-hairline">
                {ICONS[ev.type]}
              </span>

              <span
                className={`min-w-0 flex-1 text-sm font-medium leading-snug ${
                  done ? 'text-sage line-through decoration-sage/40' : current ? 'text-ink' : 'text-muted'
                }`}
              >
                {ev.label}
              </span>

              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done ? 'border-sage bg-sage' : 'border-hairline bg-white'
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 10 10" className="h-3 w-3 text-white" stroke="currentColor" strokeWidth="1.8" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 8 12" className="h-3 w-2 text-muted/35" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
