'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotificationStatus,
  requestNotificationPermission,
  scheduleProtocolNotifications,
} from '@/lib/notifications/schedule';

const ALARMS = [
  { time: '08:00', h: 8,  m: 0,  label: 'Buenos días',        emoji: '🌅' },
  { time: '10:55', h: 10, m: 55, label: 'Pastilla en 5 min',  emoji: '💊' },
  { time: '12:00', h: 12, m: 0,  label: 'Romper ayuno',       emoji: '🍽️' },
  { time: '13:45', h: 13, m: 45, label: 'Caminata post-almuerzo', emoji: '🚶' },
  { time: '19:45', h: 19, m: 45, label: 'Cerrar ventana (15 min)', emoji: '⏰' },
  { time: '20:15', h: 20, m: 15, label: 'Caminata post-cena', emoji: '🌙' },
];

function minutesSinceMidnight() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function alarmState(h: number, m: number): 'past' | 'next' | 'upcoming' {
  const nowMin = minutesSinceMidnight();
  const alarmMin = h * 60 + m;
  if (alarmMin < nowMin) return 'past';
  // first upcoming
  const first = ALARMS.find((a) => a.h * 60 + a.m >= nowMin);
  if (first && first.h === h && first.m === m) return 'next';
  return 'upcoming';
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.35 } },
};

export default function AlarmsPanel() {
  const [status, setStatus] = useState<ReturnType<typeof getNotificationStatus>>(
    () => getNotificationStatus()
  );
  const [open, setOpen] = useState(false);

  async function handleEnable() {
    const ok = await requestNotificationPermission();
    if (ok) {
      scheduleProtocolNotifications();
      setStatus('granted');
    } else {
      setStatus('denied');
    }
  }

  return (
    <div className="px-6 mb-5">
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-2 text-left group"
      >
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-muted uppercase tracking-widest font-medium">
            Alarmas del protocolo
          </p>
          {status === 'granted' && (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-sage bg-sage/10 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
              Activas
            </span>
          )}
          {status !== 'granted' && (
            <span className="text-[9px] font-semibold text-coral bg-coral/10 px-1.5 py-0.5 rounded-full">
              Inactivas
            </span>
          )}
        </div>
        <motion.svg
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-3.5 h-3.5 text-muted"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="alarms"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Enable CTA */}
            {status !== 'granted' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-center justify-between bg-amber/8 border border-amber/25 rounded-2xl px-4 py-3"
              >
                <div>
                  <p className="text-xs font-semibold text-ink">Recibe tus recordatorios</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {status === 'denied'
                      ? 'Permisos denegados. Actívalos desde los ajustes del navegador.'
                      : 'Activa las notificaciones para que Hypo te recuerde cada paso.'}
                  </p>
                </div>
                {status !== 'denied' && (
                  <button
                    onClick={handleEnable}
                    className="ml-3 shrink-0 bg-sage text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    Activar
                  </button>
                )}
              </motion.div>
            )}

            {/* Alarm rows */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-1.5"
            >
              {ALARMS.map((alarm) => {
                const state = alarmState(alarm.h, alarm.m);
                return (
                  <motion.div
                    key={alarm.time}
                    variants={item}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-colors ${
                      state === 'next'
                        ? 'bg-sage/8 border-sage/30'
                        : state === 'past'
                        ? 'bg-surface/50 border-hairline/50'
                        : 'bg-surface border-hairline'
                    }`}
                  >
                    <span className={`text-base shrink-0 ${state === 'past' ? 'opacity-40' : ''}`}>
                      {alarm.emoji}
                    </span>
                    <span
                      className={`font-mono text-sm font-semibold w-12 shrink-0 ${
                        state === 'next' ? 'text-sage' : state === 'past' ? 'text-muted/50' : 'text-muted'
                      }`}
                    >
                      {alarm.time}
                    </span>
                    <span
                      className={`flex-1 text-sm ${
                        state === 'next'
                          ? 'text-ink font-semibold'
                          : state === 'past'
                          ? 'text-muted/50 line-through'
                          : 'text-ink'
                      }`}
                    >
                      {alarm.label}
                    </span>
                    {state === 'next' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-sage bg-sage/12 px-2 py-0.5 rounded-full shrink-0">
                        Próxima
                      </span>
                    )}
                    {state === 'past' && status === 'granted' && (
                      <span className="text-[9px] text-muted/40 shrink-0">✓</span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
