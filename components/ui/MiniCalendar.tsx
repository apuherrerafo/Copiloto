'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { localDateISO, addDaysLocal } from '@/lib/dates';
import { getTodaySchedule } from '@/lib/protocols/julio';
import {
  loadAppointments,
  removeAppointment,
  TYPE_LABELS,
  type Appointment,
  type AppointmentType,
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

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Mini anillo de progreso por día (referencia dashboard) */
const MINI_R = 14;
const MINI_C = 2 * Math.PI * MINI_R;

function DayProgressRing({
  dayNum,
  letter,
  pct,
  isFuture,
  pastNoData,
  isSel,
  isToday,
}: {
  dayNum: number;
  letter: string;
  pct: number;
  isFuture: boolean;
  pastNoData: boolean;
  isSel: boolean;
  isToday: boolean;
}) {
  const dashOffset = MINI_C * (1 - Math.min(Math.max(pct, 0), 1));
  const arcColor = pct >= 1 ? '#5B7A65' : '#C09050';
  const showArc = !isFuture && !pastNoData && pct > 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`text-[9px] font-bold uppercase tracking-wide ${
          isSel ? 'text-white/90' : isToday ? 'text-sage' : 'text-muted'
        }`}
      >
        {letter}
      </span>
      <div className="relative flex h-[46px] w-[46px] items-center justify-center">
        <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="18" cy="18" r={MINI_R} fill="none" stroke="#E8E5E0" strokeWidth="2.8" />
          {showArc && (
            <circle
              cx="18"
              cy="18"
              r={MINI_R}
              fill="none"
              stroke={arcColor}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray={MINI_C}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
          )}
        </svg>
        <span
          className={`relative z-[1] text-[13px] font-bold leading-none ${
            isSel ? 'text-white' : pastNoData ? 'text-muted' : isToday ? 'text-sage' : 'text-ink'
          }`}
        >
          {pastNoData ? '?' : dayNum}
        </span>
      </div>
    </div>
  );
}

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
  if (count === 0) return 'No records';
  if (pct === 1) return 'Protocol complete!';
  if (pct >= 0.5) return `${count}/${TOTAL_KEYS} done`;
  return `${count}/${TOTAL_KEYS} done`;
}

export default function MiniCalendar() {
  const today = new Date();
  const todayISO = localDateISO(today);
  const [selected, setSelected] = useState(todayISO);
  const [days] = useState(() => buildDays(today));
  const [checksMap, setChecksMap] = useState<Record<string, DayChecks>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [protocolOpen, setProtocolOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  function buildChecksMap() {
    const map: Record<string, DayChecks> = {};
    days.forEach((d) => {
      const iso = localDateISO(d);
      if (iso <= todayISO) map[iso] = loadDayChecks(iso);
    });
    return map;
  }

  useEffect(() => {
    setChecksMap(buildChecksMap());
    setAppointments(loadAppointments());

    // Refresh when ProtocolTimeline marks/unmarks an item
    function onRefresh() {
      setChecksMap(buildChecksMap());
    }
    window.addEventListener('copiloto-refresh', onRefresh);
    window.addEventListener('hypo-storage-sync', onRefresh);
    return () => {
      window.removeEventListener('copiloto-refresh', onRefresh);
      window.removeEventListener('hypo-storage-sync', onRefresh);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function selectDate(iso: string) {
    setSelected(iso);
    setProtocolOpen(false);
    // Reload fresh checks for the newly selected date
    setChecksMap((prev) => ({
      ...prev,
      [iso]: loadDayChecks(iso),
    }));
  }

  const isFuture = selected > todayISO;
  const isToday  = selected === todayISO;
  const dayChecks = checksMap[selected];
  const selApts = appointments.filter((a) => a.date === selected);

  return (
    <div className="mb-1">
      <p className="mb-1.5 text-center font-serif text-xs italic text-ink/85">My week</p>
      {/* Horizontal strip — scroll con aire lateral para que no se corten los anillos */}
      <div
        ref={stripRef}
        className="-mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 pl-1 pr-1 pt-0.5 scrollbar-hide sm:gap-2 sm:-mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' as const }}
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
          const pastNoData = !isFut && iso < todayISO && !dc?.hasData;

          return (
            <button
              key={iso}
              data-today={isT ? 'true' : undefined}
              onClick={() => selectDate(iso)}
              className={`flex-none rounded-3xl px-2 py-2 transition-all duration-300 ${
                isSel
                  ? 'bg-sage text-white shadow-lift ring-2 ring-sage/25 ring-offset-2 ring-offset-transparent'
                  : isT
                    ? 'bg-white/70 shadow-soft ring-1 ring-sage/20 backdrop-blur-sm'
                    : 'bg-white/40 text-muted ring-1 ring-transparent backdrop-blur-sm hover:bg-white/70 hover:ring-hairline'
              }`}
              style={{ minWidth: 52 }}
            >
              <DayProgressRing
                dayNum={d.getDate()}
                letter={DAY_LETTERS[d.getDay()]}
                pct={pct}
                isFuture={isFut}
                pastNoData={pastNoData}
                isSel={isSel}
                isToday={isT}
              />
              {hasApt ? (
                <span className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${aptType ? TYPE_COLORS[aptType] : 'bg-coral/60'}`} />
              ) : (
                <span className="mt-1 block h-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail panel — compacto */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-2 space-y-1.5"
        >
          {/* Past or today: protocol summary */}
          {!isFuture && (
            <>
              {dayChecks?.hasData ? (
                <details
                  className="rounded-xl border border-hairline bg-white/70 shadow-soft backdrop-blur-sm open:shadow-md"
                  open={protocolOpen}
                  onToggle={(e) => setProtocolOpen((e.target as HTMLDetailsElement).open)}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none shrink-0">
                        {dayChecks.count === TOTAL_KEYS ? '🌟' : dayChecks.count >= 3 ? '✅' : '🟡'}
                      </span>
                      <span className={`text-xs font-semibold leading-tight truncate ${pctColor(dayChecks.count / TOTAL_KEYS)}`}>
                        {pctLabel(dayChecks.count / TOTAL_KEYS, dayChecks.count)}
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${protocolOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t border-hairline/70 px-3 pb-2.5 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {PROTOCOL_EVENTS.map((ev) => (
                        <span key={ev.key} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          dayChecks.keys[ev.key]
                            ? 'bg-sage/15 text-sage'
                            : 'bg-ink/6 text-muted line-through'
                        }`}>
                          {ev.key === 'pill' ? 'Levo' :
                           ev.key === 'fastBreak' ? 'Break' :
                           ev.key === 'walkLunch' ? 'Walk' :
                           ev.key === 'lastMeal' ? 'Dinner' : 'Stroll'}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              ) : (
                <p className="rounded-lg border border-dashed border-hairline/70 bg-white/35 px-3 py-1.5 text-center text-[11px] leading-snug text-muted">
                  {isToday
                    ? 'No protocol entries today · check them below in your day plan'
                    : 'No protocol data for this day'}
                </p>
              )}
            </>
          )}

          {/* Future: show placeholder */}
          {isFuture && !selApts.length && (
            <p className="rounded-lg border border-dashed border-hairline/70 bg-white/35 px-3 py-1.5 text-center text-[11px] text-muted">
              Future day
            </p>
          )}

          {/* Appointments for selected day */}
          {selApts.map((apt) => (
            <div key={apt.id} className="flex items-start justify-between gap-2 rounded-xl border border-hairline bg-white/80 px-3 py-2">
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

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
