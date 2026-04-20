'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getUpcomingAppointments,
  TYPE_LABELS,
  type Appointment,
} from '@/lib/store/appointments';
import { localDateISO } from '@/lib/dates';

function relativeDayLabel(iso: string): string {
  const todayISO = localDateISO();
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msDay = 1000 * 60 * 60 * 24;
  const diff = Math.round((target.getTime() - today.getTime()) / msDay);
  if (iso === todayISO) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff > 1 && diff < 7) {
    const name = target.toLocaleDateString('es-MX', { weekday: 'long' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return target.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export default function UpcomingAppointments() {
  const [appts, setAppts] = useState<Appointment[]>([]);

  useEffect(() => {
    const load = () => setAppts(getUpcomingAppointments());
    load();
    const onRefresh = () => load();
    window.addEventListener('copiloto-refresh', onRefresh);
    return () => window.removeEventListener('copiloto-refresh', onRefresh);
  }, []);

  const next = useMemo(() => appts.slice(0, 3), [appts]);
  const hasAny = next.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
      aria-label="Próximas citas médicas"
    >
      <div className="mb-2 flex items-end justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          Próximas citas
        </p>
        <Link
          href="/historial"
          className="text-[11px] font-medium text-sage/90 hover:text-sage"
        >
          Ver todas →
        </Link>
      </div>

      {hasAny ? (
        <ul className="space-y-2">
          {next.map((apt) => (
            <li
              key={apt.id}
              className="flex items-center gap-3 rounded-[16px] border border-coral/25 bg-white/90 px-3 py-2.5 shadow-soft"
            >
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-coral/12 text-coral">
                <span className="text-[9px] font-bold uppercase leading-none tracking-wider">
                  {relativeDayLabel(apt.date).slice(0, 3)}
                </span>
                <span className="mt-0.5 font-serif text-[18px] italic leading-none">
                  {apt.time ?? '—'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold leading-tight text-ink">
                  {apt.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-snug text-muted">
                  {relativeDayLabel(apt.date)} · {TYPE_LABELS[apt.type]}
                  {apt.notes ? ` · ${apt.notes.split(/\s*·\s*|\n/)[0]}` : ''}
                </p>
              </div>
            </li>
          ))}
          <li>
            <Link
              href="/registrar?type=appointment"
              className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-coral/40 bg-coral/5 px-3 py-2 text-[12px] font-semibold text-coral transition-colors hover:bg-coral/10"
            >
              <span className="text-[14px] leading-none">+</span>
              Agendar otra cita
            </Link>
          </li>
        </ul>
      ) : (
        <Link
          href="/registrar?type=appointment"
          className="flex w-full items-center gap-3 rounded-[16px] border border-dashed border-coral/35 bg-white/70 px-3 py-3 text-left shadow-soft transition-colors hover:bg-white/90"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" strokeLinejoin="round" />
              <path d="M12 13v4M10 15h4" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight text-ink">
              Agenda tu próxima cita médica
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">
              Aparecerá aquí y en tu historial con recordatorios.
            </p>
          </div>
          <span className="text-[18px] font-light leading-none text-coral">+</span>
        </Link>
      )}
    </motion.section>
  );
}
