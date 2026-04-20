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

const PROTOCOL_EVENTS = getTodaySchedule();
const PROTOCOL_KEYS = PROTOCOL_EVENTS.map((e) => e.key);
const TOTAL_KEYS = PROTOCOL_KEYS.length;

interface DayChecks {
  count: number;
  keys: Record<string, boolean>;
  hasData: boolean;
}

function loadDayChecks(date: string): DayChecks {
  if (typeof window === 'undefined') return { count: 0, keys: {}, hasData: false };
  try {
    const raw = localStorage.getItem(`copiloto_checked_${date}`);
    if (!raw) return { count: 0, keys: {}, hasData: false };
    const obj = JSON.parse(raw) as Record<string, boolean>;
    const count = PROTOCOL_KEYS.filter((k) => obj[k]).length;
    return { count, keys: obj, hasData: count > 0 };
  } catch {
    return { count: 0, keys: {}, hasData: false };
  }
}

function buildDays(today: Date, past = 14, future = 10): Date[] {
  const days: Date[] = [];
  for (let i = -past; i <= future; i++) days.push(addDaysLocal(today, i));
  return days;
}

const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const TYPE_COLORS: Record<AppointmentType, string> = {
  medico: 'bg-coral/70',
  examen: 'bg-amber/70',
  lab:    'bg-sage/70',
  otro:   'bg-ink/30',
};

function pctColor(pct: number): string {
  if (pct === 0) return 'text-muted';
  if (pct < 0.5) return 'text-coral';
  if (pct < 1) return 'text-amber';
  return 'text-sage';
}

function pctLabel(pct: number, count: number): string {
  if (count === 0) return 'Sin registros';
  if (pct === 1) return '¡Protocolo completo!';
  if (pct >= 0.5) return `${count}/${TOTAL_KEYS} completado`;
  return `${count}/${TOTAL_KEYS} completado`;
}

export default function MiniCalendar() {
  const today = new Date();
  const todayISO = localDateISO(today);
  const [selected, setSelected] = useState(todayISO);
  const [days] = useState(() => buildDays(today));
  const [checksMap, setChecksMap] = useState<Record<string, DayChecks>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map: Record<string, DayChecks> = {};
    days.forEach((d) => {
      const iso = localDateISO(d);
      if (iso <= todayISO) map[iso] = loadDayChecks(iso);
    });
    setChecksMap(map);
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

  function reloadApts() { setAppointments(loadAppointments()); }

  const isFuture = selected > todayISO;
  const isPast   = selected < todayISO;
  const isToday  = selected === todayISO;
  const dayChecks = checksMap[selected];
  const selApts = appointments.filter((a) => a.date === selected);

  return (
    <div className="mb-2">
      {/* Horizontal strip */}
      <div
        ref={stripRef}
        className="flex gap-1.5 overflow-x-auto px-6 pb-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {days.map((d) => {
          const iso = localDateISO(d);
          const isT = iso === todayISO;
          const isFut = iso > todayISO;
          const isSel = iso === selected;
          const dc = checksMap[iso];
          const pct = dc && TOTAL_KEYS > 0 ? dc.count / TOTAL_KEYS : 0;
          const hasApt = appointments.some((a) => a.date === iso);
          const aptType = appointments.find((a) => a.date === iso)?.type;

          return (
            <button
              key={iso}
              data-today={isT ? 'true' : undefined}
              onClick={() => setSelected(iso)}
              className={`flex-none flex flex-col items-center gap-0.5 rounded-2xl px-2.5 py-2 transition-all ${
                isSel ? 'bg-sage text-white shadow-soft' : isT ? 'bg-sage/10 text-sage' : 'text-muted hover:bg-surface'
              }`}
              style={{ minWidth: 44 }}
            >
              <span className={`text-[9px] font-semibold uppercase ${isSel ? 'text-white/70' : 'text-muted'}`}>
                {DAY_LETTERS[d.getDay()]}
              </span>
              <span className={`text-sm font-bold leading-none ${isSel ? 'text-white' : isT ? 'text-sage' : 'text-ink'}`}>
                {d.getDate()}
              </span>
              {/* Protocol dots */}
              {!isFut ? (
                <div className="flex gap-[2px] mt-0.5">
                  {PROTOCOL_KEYS.map((k, i) => (
                    <span key={k} className={`w-1 h-1 rounded-full transition-colors ${
                      dc?.keys[k] ? (isSel ? 'bg-white' : 'bg-sage') : (isSel ? 'bg-white/25' : 'bg-ink/12')
                    }`} />
                  ))}
                </div>
              ) : (
                <div className="h-2.5" />
              )}
              {/* Appointment indicator */}
              {hasApt ? (
                <span className={`w-1.5 h-1.5 rounded-full ${aptType ? TYPE_COLORS[aptType] : 'bg-coral/60'}`} />
              ) : (
                <span className="h-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="mx-6 mt-3 space-y-2"
        >
          {/* Past or today: protocol summary */}
          {!isFuture && (
            <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
              dayChecks?.hasData ? 'border-hairline bg-surface' : 'border-hairline/60 bg-surface/60'
            }`}>
              {dayChecks?.hasData ? (
                <>
                  <span className="text-xl shrink-0">
                    {dayChecks.count === TOTAL_KEYS ? '🌟' : dayChecks.count >= 3 ? '✅' : '🟡'}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${pctColor(dayChecks.count / TOTAL_KEYS)}`}>
                      {pctLabel(dayChecks.count / TOTAL_KEYS, dayChecks.count)}
                    </p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {PROTOCOL_EVENTS.map((ev) => (
                        <span key={ev.key} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          dayChecks.keys[ev.key]
                            ? 'bg-sage/15 text-sage'
                            : 'bg-ink/6 text-muted line-through'
                        }`}>
                          {ev.key === 'pill' ? 'Levo' :
                           ev.key === 'fastBreak' ? 'Romper' :
                           ev.key === 'walkLunch' ? 'Caminar' :
                           ev.key === 'lastMeal' ? 'Cena' : 'Paseo'}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-xl shrink-0">😔</span>
                  <div>
                    <p className="text-sm font-medium text-muted">
                      {isToday ? 'Aún sin registros hoy' : 'Sin información de este día'}
                    </p>
                    <p className="text-[10px] text-muted/70 mt-0.5">
                      {isToday ? 'Marca ítems del protocolo para verlos aquí.' : 'No hay actividad registrada para esta fecha.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Future: show placeholder */}
          {isFuture && !selApts.length && (
            <div className="rounded-2xl border border-hairline/60 bg-surface/60 px-4 py-3 flex items-center gap-3">
              <span className="text-xl shrink-0">📅</span>
              <p className="text-sm text-muted">Día futuro — agrega una cita o evento.</p>
            </div>
          )}

          {/* Appointments for selected day */}
          {selApts.map((apt) => (
            <div key={apt.id} className="flex items-start justify-between gap-2 bg-surface border border-hairline rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{apt.title}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {TYPE_LABELS[apt.type]}{apt.time ? ` · ${apt.time}` : ''}
                </p>
                {apt.notes ? <p className="text-[10px] text-muted/70 mt-0.5">{apt.notes}</p> : null}
              </div>
              <button
                onClick={() => { removeAppointment(apt.id); reloadApts(); }}
                className="text-muted/40 hover:text-coral text-xs mt-0.5 shrink-0 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add appointment button */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-[11px] text-sage font-semibold hover:opacity-80 transition-opacity py-0.5"
          >
            <span className="w-4 h-4 rounded-full bg-sage/15 flex items-center justify-center text-sage text-xs leading-none">+</span>
            Agregar cita u evento
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Add appointment sheet */}
      <AnimatePresence>
        {showAdd && (
          <AddAppointmentSheet
            defaultDate={selected}
            onSave={(apt) => { addAppointment(apt); reloadApts(); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
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
  const [title, setTitle]   = useState('');
  const [date, setDate]     = useState(defaultDate);
  const [time, setTime]     = useState('');
  const [type, setType]     = useState<AppointmentType>('medico');
  const [notes, setNotes]   = useState('');

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
            type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Endocrinólogo, TSH, Ecosonograma"
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink" />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Hora (opcional)</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Tipo</label>
          <div className="grid grid-cols-4 gap-1.5">
            {APT_TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`rounded-xl border py-2 text-xs font-medium transition-colors ${
                  type === t.value ? 'border-sage bg-sage/10 text-sage' : 'border-hairline bg-white text-muted'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Notas (opcional)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. en ayunas, traer resultados"
            className="w-full rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink" />
        </div>

        <button onClick={handleSave} disabled={!title.trim() || !date}
          className="w-full rounded-2xl bg-sage py-3.5 text-sm font-semibold text-white disabled:opacity-40 transition-opacity">
          Guardar
        </button>
      </motion.div>
    </motion.div>
  );
}
