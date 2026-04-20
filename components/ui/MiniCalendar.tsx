'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { localDateISO, addDaysLocal } from '@/lib/dates';
import { getTodaySchedule } from '@/lib/protocols/julio';
import {
  loadAppointments,
  addAppointment,
  removeAppointment,
  TYPE_LABELS,
  type AppointmentType,
  type Appointment,
} from '@/lib/store/appointments';

const PROTOCOL_KEYS = getTodaySchedule().map((e) => e.key);
const TOTAL_KEYS = PROTOCOL_KEYS.length;

function loadChecksForDate(date: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(`copiloto_checked_${date}`);
    if (!raw) return 0;
    const obj = JSON.parse(raw) as Record<string, boolean>;
    return PROTOCOL_KEYS.filter((k) => obj[k]).length;
  } catch {
    return 0;
  }
}

function buildDays(today: Date, past = 14, future = 10): Date[] {
  const days: Date[] = [];
  for (let i = -past; i <= future; i++) {
    days.push(addDaysLocal(today, i));
  }
  return days;
}

const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const TYPE_COLORS: Record<AppointmentType, string> = {
  medico: 'bg-coral/80',
  examen: 'bg-amber/80',
  lab:    'bg-sage/80',
  otro:   'bg-ink/40',
};

interface Props {
  onSelectDate?: (date: string) => void;
}

export default function MiniCalendar({ onSelectDate }: Props) {
  const today = new Date();
  const todayISO = localDateISO(today);
  const [selected, setSelected] = useState(todayISO);
  const [days] = useState(() => buildDays(today));
  const [checks, setChecks] = useState<Record<string, number>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  // Load checks from localStorage for each day
  useEffect(() => {
    const map: Record<string, number> = {};
    days.forEach((d) => {
      const iso = localDateISO(d);
      if (iso <= todayISO) map[iso] = loadChecksForDate(iso);
    });
    setChecks(map);
    setAppointments(loadAppointments());
  }, [days, todayISO]);

  // Scroll today into center on mount
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const todayEl = strip.querySelector('[data-today="true"]') as HTMLElement | null;
    if (todayEl) {
      const offset = todayEl.offsetLeft - strip.clientWidth / 2 + todayEl.clientWidth / 2;
      strip.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, []);

  function select(iso: string) {
    setSelected(iso);
    onSelectDate?.(iso);
  }

  const selectedApts = appointments.filter((a) => a.date === selected);

  function reloadApts() {
    setAppointments(loadAppointments());
  }

  return (
    <div className="mb-4">
      {/* Horizontal day strip */}
      <div
        ref={stripRef}
        className="flex gap-1.5 overflow-x-auto px-6 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {days.map((d) => {
          const iso = localDateISO(d);
          const isToday = iso === todayISO;
          const isFuture = iso > todayISO;
          const isSel = iso === selected;
          const done = checks[iso] ?? 0;
          const pct = isFuture ? 0 : TOTAL_KEYS > 0 ? done / TOTAL_KEYS : 0;
          const hasApt = appointments.some((a) => a.date === iso);
          const aptType = appointments.find((a) => a.date === iso)?.type;

          return (
            <button
              key={iso}
              data-today={isToday ? 'true' : undefined}
              onClick={() => select(iso)}
              className={`flex-none flex flex-col items-center gap-1 rounded-2xl px-2.5 py-2 transition-all ${
                isSel
                  ? 'bg-sage text-white shadow-soft'
                  : isToday
                  ? 'bg-sage/10 text-sage'
                  : 'text-muted hover:bg-surface'
              }`}
              style={{ minWidth: 44 }}
            >
              <span className={`text-[9px] font-semibold uppercase ${isSel ? 'text-white/70' : 'text-muted'}`}>
                {DAY_LETTERS[d.getDay()]}
              </span>
              <span className={`text-sm font-bold leading-none ${isSel ? 'text-white' : isToday ? 'text-sage' : 'text-ink'}`}>
                {d.getDate()}
              </span>
              {/* Completion arc */}
              {!isFuture ? (
                <CompletionDots pct={pct} active={isSel} />
              ) : (
                <span className="h-3 w-3" />
              )}
              {/* Appointment dot */}
              {hasApt ? (
                <span className={`w-1.5 h-1.5 rounded-full ${aptType ? TYPE_COLORS[aptType] : 'bg-coral/70'}`} />
              ) : (
                <span className="w-1.5 h-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mx-6 mt-1"
        >
          {selectedApts.length > 0 ? (
            <div className="flex flex-col gap-1.5 mb-2">
              {selectedApts.map((apt) => (
                <div key={apt.id} className="flex items-start justify-between gap-2 bg-surface border border-hairline rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-ink">{apt.title}</p>
                    <p className="text-[10px] text-muted">
                      {TYPE_LABELS[apt.type]}{apt.time ? ` · ${apt.time}` : ''}
                    </p>
                    {apt.notes ? <p className="text-[10px] text-muted/70 mt-0.5">{apt.notes}</p> : null}
                  </div>
                  <button
                    onClick={() => { removeAppointment(apt.id); reloadApts(); }}
                    className="text-muted/50 hover:text-coral text-xs mt-0.5 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-[11px] text-sage font-semibold hover:opacity-80 transition-opacity"
          >
            <span className="w-4 h-4 rounded-full bg-sage/15 flex items-center justify-center text-sage text-xs">+</span>
            Agregar cita u evento
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Add appointment sheet */}
      <AnimatePresence>
        {showAdd ? (
          <AddAppointmentSheet
            defaultDate={selected}
            onSave={(apt) => { addAppointment(apt); reloadApts(); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CompletionDots({ pct, active }: { pct: number; active: boolean }) {
  const filled = Math.round(pct * TOTAL_KEYS);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: TOTAL_KEYS }).map((_, i) => (
        <span
          key={i}
          className={`w-1 h-1 rounded-full transition-colors ${
            i < filled
              ? active ? 'bg-white' : 'bg-sage'
              : active ? 'bg-white/30' : 'bg-ink/15'
          }`}
        />
      ))}
    </div>
  );
}

const APT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: 'medico', label: '🩺 Médico' },
  { value: 'examen', label: '🔬 Examen' },
  { value: 'lab',    label: '🧪 Lab' },
  { value: 'otro',   label: '📅 Otro' },
];

function AddAppointmentSheet({
  defaultDate,
  onSave,
  onClose,
}: {
  defaultDate: string;
  onSave: (apt: Omit<Appointment, 'id'>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('medico');
  const [notes, setNotes] = useState('');

  const handleSave = useCallback(() => {
    if (!title.trim() || !date) return;
    onSave({ title: title.trim(), date, time: time || undefined, type, notes: notes.trim() || undefined });
  }, [title, date, time, type, notes, onSave]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/40 flex items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full bg-background rounded-t-3xl px-6 pt-5 pb-10 space-y-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-serif italic text-lg text-ink">Nueva cita / evento</p>
          <button onClick={onClose} className="text-muted text-xl leading-none">✕</button>
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Endocrinólogo, TSH, Ecosonograma"
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Hora (opcional)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Tipo</label>
          <div className="grid grid-cols-4 gap-1.5">
            {APT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`rounded-xl border py-2 text-xs font-medium transition-colors ${
                  type === t.value ? 'border-sage bg-sage/10 text-sage' : 'border-hairline bg-white text-muted'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Notas (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. en ayunas, traer resultados"
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!title.trim() || !date}
          className="w-full rounded-2xl bg-sage py-3.5 text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
        >
          Guardar
        </button>
      </motion.div>
    </motion.div>
  );
}
