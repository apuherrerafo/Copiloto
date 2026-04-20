'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllLogs, type LogEntry, type ProCheckInValue } from '@/lib/store/db';
import {
  loadAppointments,
  removeAppointment,
  TYPE_LABELS as APPT_TYPE_LABELS,
  type Appointment,
} from '@/lib/store/appointments';
import { localDateISO } from '@/lib/dates';
import MonthlyComplianceRings from '@/components/history/MonthlyComplianceRings';

type Tab = 'clinica' | 'agenda';

type FilterKey =
  | 'all'
  | 'appointment'
  | 'medication'
  | 'meal'
  | 'symptom'
  | 'walking'
  | 'checkin'
  | 'note';

const FILTER_ORDER: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'medication', label: 'Medication' },
  { key: 'meal', label: 'Meals' },
  { key: 'symptom', label: 'Symptoms' },
  { key: 'walking', label: 'Walks' },
  { key: 'checkin', label: 'Check-in' },
  { key: 'note', label: 'Notes' },
];

const TYPE_LABELS: Record<string, string> = {
  meal: 'Meal',
  medication: 'Medication',
  symptom: 'Symptom',
  note: 'Note',
  fast: 'Fast',
  walking: 'Walk',
  checkin: 'Check-in',
  appointment: 'Appointment',
};

const TYPE_ICON: Record<string, (c: string) => ReactElement> = {
  medication: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5.5 12a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
      <path d="M7.8 9.7l8.4 4.6" />
    </svg>
  ),
  meal: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 3v8a3 3 0 003 3v7M12 3v6M18 3v4a3 3 0 01-3 3v11" strokeLinecap="round" />
    </svg>
  ),
  symptom: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M13 2L5 14h6l-1 8 8-12h-6l1-8z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  walking: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="13" cy="4.5" r="1.8" />
      <path d="M10 21l2-7 3 2 3 5M8 14l4-4 2 3M6 16l2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  checkin: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 14l4 4 12-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  note: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 4h9l3 3v13H6z" strokeLinejoin="round" />
      <path d="M9 10h6M9 14h6M9 18h3" strokeLinecap="round" />
    </svg>
  ),
  appointment: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" strokeLinecap="round" />
    </svg>
  ),
  fast: (c) => (
    <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 9v4l2.5 1.5M10 3h4" strokeLinecap="round" />
    </svg>
  ),
};

const TYPE_TONE: Record<string, { dot: string; ring: string; tint: string; text: string }> = {
  medication: { dot: 'bg-sage', ring: 'ring-sage/20', tint: 'bg-sage/10', text: 'text-sage' },
  meal: { dot: 'bg-amber', ring: 'ring-amber/20', tint: 'bg-amber/12', text: 'text-amber' },
  symptom: { dot: 'bg-coral', ring: 'ring-coral/20', tint: 'bg-coral/10', text: 'text-coral' },
  walking: { dot: 'bg-sky-500', ring: 'ring-sky-200', tint: 'bg-sky-50', text: 'text-sky-600' },
  checkin: { dot: 'bg-sage', ring: 'ring-sage/20', tint: 'bg-sage/10', text: 'text-sage' },
  note: { dot: 'bg-muted', ring: 'ring-hairline', tint: 'bg-white', text: 'text-muted' },
  fast: { dot: 'bg-amber', ring: 'ring-amber/20', tint: 'bg-amber/10', text: 'text-amber' },
  appointment: { dot: 'bg-coral', ring: 'ring-coral/20', tint: 'bg-coral/12', text: 'text-coral' },
};

function toneFor(type: string) {
  return TYPE_TONE[type] ?? TYPE_TONE.note;
}

function iconFor(type: string, cls: string) {
  const fn = TYPE_ICON[type] ?? TYPE_ICON.note;
  return fn(cls);
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const todayISO = localDateISO(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yestISO = localDateISO(yesterday);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomISO = localDateISO(tomorrow);

  if (iso === todayISO) {
    const rest = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return `Today, ${rest}`;
  }
  if (iso === yestISO) {
    const rest = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return `Yesterday, ${rest}`;
  }
  if (iso === tomISO) {
    const rest = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return `Tomorrow, ${rest}`;
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function appointmentTimestamp(apt: Appointment): number {
  const [y, m, d] = apt.date.split('-').map(Number);
  const [hh, mm] = (apt.time ?? '12:00').split(':').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 12, mm ?? 0, 0, 0).getTime();
}

type TimelineItem =
  | { kind: 'log'; id: string; date: string; ts: number; type: string; entry: LogEntry }
  | { kind: 'appt'; id: string; date: string; ts: number; type: 'appointment'; appt: Appointment };

type GroupedDay = { date: string; label: string; items: TimelineItem[] };

export default function HistorialPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('clinica');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  function loadAll(silent = false) {
    if (!silent) setLoading(true);
    setAppts(loadAppointments());
    getAllLogs().then((all) => {
      setLogs(all);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadAll(false);
    const onRefresh = () => loadAll(true);
    window.addEventListener('copiloto-refresh', onRefresh);
    return () => window.removeEventListener('copiloto-refresh', onRefresh);
  }, []);

  const allItems = useMemo<TimelineItem[]>(() => {
    const logItems: TimelineItem[] = logs.map((l) => ({
      kind: 'log',
      id: `log-${l.id ?? `${l.date}-${l.timestamp}`}`,
      date: l.date,
      ts: l.timestamp,
      type: l.type,
      entry: l,
    }));
    const apptItems: TimelineItem[] = appts.map((a) => ({
      kind: 'appt',
      id: `apt-${a.id}`,
      date: a.date,
      ts: appointmentTimestamp(a),
      type: 'appointment',
      appt: a,
    }));
    return [...logItems, ...apptItems];
  }, [logs, appts]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: allItems.length,
      appointment: 0,
      medication: 0,
      meal: 0,
      symptom: 0,
      walking: 0,
      checkin: 0,
      note: 0,
    };
    for (const it of allItems) {
      if (it.type in c) c[it.type as FilterKey]++;
    }
    return c;
  }, [allItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((it) => {
      if (filter !== 'all' && it.type !== filter) return false;
      if (!q) return true;
      if (it.kind === 'log') {
        const l = it.entry;
        const hay =
          (l.label ?? '').toLowerCase() +
          ' ' +
          (l.notes ?? '').toLowerCase() +
          ' ' +
          (l.symptomTags ?? []).join(' ');
        return hay.includes(q);
      } else {
        const a = it.appt;
        const hay =
          (a.title ?? '').toLowerCase() + ' ' + (a.notes ?? '').toLowerCase();
        return hay.includes(q);
      }
    });
  }, [allItems, filter, query]);

  const { upcoming, past } = useMemo(() => {
    const todayISO = localDateISO();
    const future: TimelineItem[] = [];
    const paste: TimelineItem[] = [];
    for (const it of filtered) {
      if (it.date > todayISO) future.push(it);
      else paste.push(it);
    }
    const groupBy = (arr: TimelineItem[], asc: boolean): GroupedDay[] => {
      const map = new Map<string, TimelineItem[]>();
      for (const it of arr) {
        const a = map.get(it.date) ?? [];
        a.push(it);
        map.set(it.date, a);
      }
      return [...map.entries()]
        .sort(([a], [b]) => (asc ? a.localeCompare(b) : b.localeCompare(a)))
        .map(([date, items]) => ({
          date,
          label: formatDateLabel(date),
          items: items.sort((x, y) => (asc ? x.ts - y.ts : y.ts - x.ts)),
        }));
    };
    return {
      upcoming: groupBy(future, true),
      past: groupBy(paste, false),
    };
  }, [filtered]);

  function handleDeleteAppointment(id: string) {
    removeAppointment(id);
    setAppts(loadAppointments());
  }

  return (
    <div className="home-mesh min-h-screen">
      <div className="px-safe pt-10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted/80">Your story</p>
        <h1 className="mt-1 font-serif text-[2.25rem] italic leading-[1.05] text-ink">
          Everything you <span className="text-sage">did for yourself</span>
        </h1>
      </div>

      {/* Tabs: Historia clínica · Agenda */}
      <div className="px-safe">
        <div className="flex rounded-full border border-hairline/80 bg-white/85 p-1 shadow-soft">
          {([
            { key: 'clinica', label: 'Clinical history' },
            { key: 'agenda', label: 'Schedule' },
          ] as { key: Tab; label: string }[]).map((t) => {
            const active = tab === t.key;
            return (
              <motion.button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                whileTap={{ scale: 0.96 }}
                className={`relative flex-1 rounded-full px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                  active ? 'text-white' : 'text-ink/70 hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="historia-tab-pill"
                    className="absolute inset-0 rounded-full bg-sage shadow-[0_4px_14px_-6px_rgba(91,122,101,0.55)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 px-safe">
        <MonthlyComplianceRings />
      </div>

      <AnimatePresence mode="wait">
        {tab === 'agenda' ? (
          <motion.div
            key="agenda"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="pb-nav-clear"
          >
            <AgendaView
              appointments={appts}
              loading={loading}
              onDelete={handleDeleteAppointment}
            />
          </motion.div>
        ) : (
          <motion.div
            key="clinica"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
      <div className="mt-3 px-safe">
        <label className="relative flex w-full items-center">
          <span className="absolute left-3 text-muted">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your history…"
            className="h-11 w-full rounded-full border border-hairline/80 bg-white/90 pl-9 pr-4 text-[13px] text-ink placeholder:text-muted/80 shadow-soft outline-none focus:ring-2 focus:ring-sage/30"
          />
        </label>
      </div>

      <div className="mt-3 overflow-x-auto px-safe no-scrollbar">
        <div className="flex gap-2">
          {FILTER_ORDER.map(({ key, label }) => {
            const active = filter === key;
            const count = counts[key];
            if (count === 0 && key !== 'all') return null;
            return (
              <motion.button
                key={key}
                onClick={() => setFilter(key)}
                whileTap={{ scale: 0.94 }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  active
                    ? 'border-ink bg-ink text-white'
                    : 'border-hairline/80 bg-white/85 text-ink/80 hover:bg-white'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold leading-tight ${
                    active ? 'bg-white/20 text-white' : 'bg-hairline/60 text-muted'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-safe pb-nav-clear mt-5">
        {loading && <p className="py-12 text-center text-sm text-muted">Loading…</p>}

        {!loading && upcoming.length === 0 && past.length === 0 && (
          <div className="py-16 text-center">
            <p className="mb-3 text-4xl">📋</p>
            <p className="text-sm text-muted">No entries yet</p>
            <p className="mt-1 text-xs text-muted/70">Tap the green + to log your first one</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <section className="mb-7">
            <h2 className="mb-3 font-serif text-[15px] italic text-coral">Coming up</h2>
            <ul className="relative">
              <span aria-hidden className="absolute left-[52px] top-1 bottom-1 w-px bg-hairline/90" />
              {upcoming.flatMap((day) => [
                <li key={`hd-${day.date}`} className="mb-2 grid grid-cols-[44px_18px_1fr] gap-x-2">
                  <span />
                  <span />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/80 capitalize">
                    {day.label}
                  </span>
                </li>,
                ...day.items.map((it) => <TimelineRow key={`u-${it.id}`} item={it} />),
              ])}
            </ul>
          </section>
        )}

        {past.map((day) => (
          <section key={day.date} className="mb-7">
            <h2 className="mb-3 font-serif text-[15px] italic capitalize text-coral">{day.label}</h2>
            <ul className="relative">
              <span aria-hidden className="absolute left-[52px] top-1 bottom-1 w-px bg-hairline/90" />
              {day.items.map((it) => (
                <TimelineRow key={it.id} item={it} />
              ))}
            </ul>
          </section>
        ))}
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function apptTimestamp(a: Appointment): number {
  return appointmentTimestamp(a);
}

function relativeDay(iso: string): string {
  const todayISO = localDateISO();
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (iso === todayISO) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) {
    return target.toLocaleDateString('en-US', { weekday: 'long' });
  }
  if (diff > -7 && diff < -1) {
    const n = target.toLocaleDateString('en-US', { weekday: 'long' });
    return `Last ${n}`;
  }
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function AgendaView({
  appointments,
  loading,
  onDelete,
}: {
  appointments: Appointment[];
  loading: boolean;
  onDelete: (id: string) => void;
}) {
  const todayISO = localDateISO();
  const upcoming = appointments
    .filter((a) => a.date >= todayISO)
    .sort((a, b) => apptTimestamp(a) - apptTimestamp(b));
  const pastApts = appointments
    .filter((a) => a.date < todayISO)
    .sort((a, b) => apptTimestamp(b) - apptTimestamp(a));

  const doctorStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; last: string }>();
    for (const a of appointments) {
      const key = a.title.trim().toLowerCase();
      if (!key) continue;
      const current = map.get(key);
      if (current) {
        current.count++;
        if (a.date > current.last) current.last = a.date;
      } else {
        map.set(key, { name: a.title.trim(), count: 1, last: a.date });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [appointments]);

  return (
    <div className="px-safe mt-4">
      {loading ? (
        <p className="py-12 text-center text-sm text-muted">Loading…</p>
      ) : appointments.length === 0 ? (
        <div className="py-14 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-coral"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" strokeLinejoin="round" />
              <path d="M12 13v4M10 15h4" strokeLinecap="round" />
            </svg>
          </motion.div>
          <p className="font-serif text-[18px] italic text-ink">No appointments scheduled</p>
          <p className="mt-1 text-[12px] text-muted/80">When you schedule one it will appear here.</p>
          <Link
            href="/registrar?type=appointment"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-[12px] font-semibold text-white shadow-soft transition-transform active:scale-95"
          >
            + Schedule first appointment
          </Link>
        </div>
      ) : (
        <>
          {/* Resumen de doctores */}
          {doctorStats.length > 0 && (
            <section className="mb-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                Your doctors · recent visits
              </p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
                {doctorStats.map((doc, i) => (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    className="flex min-w-[160px] shrink-0 items-center gap-2 rounded-2xl border border-hairline/70 bg-white/90 px-3 py-2 shadow-soft"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage/15 text-[14px] font-serif italic text-sage">
                      {doc.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold leading-tight text-ink">
                        {doc.name}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        {doc.count} {doc.count === 1 ? 'visit' : 'visits'} · {relativeDay(doc.last)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Próximas */}
          {upcoming.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 font-serif text-[16px] italic text-coral">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                Upcoming ({upcoming.length})
              </h2>
              <ul className="space-y-2.5">
                {upcoming.map((apt, i) => (
                  <AppointmentCard key={apt.id} apt={apt} index={i} upcoming onDelete={onDelete} />
                ))}
              </ul>
              <Link
                href="/registrar?type=appointment"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-coral/40 bg-coral/5 px-3 py-2.5 text-[12.5px] font-semibold text-coral transition-colors hover:bg-coral/10"
              >
                <span className="text-[15px] leading-none">+</span>
                Schedule another appointment
              </Link>
            </section>
          )}

          {/* Pasadas */}
          {pastApts.length > 0 && (
            <section className="mb-4">
              <h2 className="mb-3 flex items-center gap-2 font-serif text-[16px] italic text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-muted/60" />
                Past ({pastApts.length})
              </h2>
              <ul className="space-y-2">
                {pastApts.map((apt, i) => (
                  <AppointmentCard key={apt.id} apt={apt} index={i} upcoming={false} onDelete={onDelete} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function AppointmentCard({
  apt,
  index,
  upcoming,
  onDelete,
}: {
  apt: Appointment;
  index: number;
  upcoming: boolean;
  onDelete: (id: string) => void;
}) {
  const parsed = parseAppointmentNotes(apt.notes);
  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.03 * index, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-start gap-3 rounded-2xl border px-3 py-3 shadow-soft ${
        upcoming
          ? 'border-coral/25 bg-white/95'
          : 'border-hairline/60 bg-white/75'
      }`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${
          upcoming ? 'bg-coral/12 text-coral' : 'bg-muted/10 text-muted'
        }`}
      >
        <span className="text-[9px] font-bold uppercase leading-none tracking-[0.14em]">
          {relativeDay(apt.date).slice(0, 3)}
        </span>
        <span className="mt-0.5 font-serif text-[20px] italic leading-none text-ink">
          {apt.time ?? '—'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-tight text-ink">{apt.title}</p>
        <p className="mt-0.5 truncate text-[11.5px] leading-snug text-muted">
          {relativeDay(apt.date)} · {APPT_TYPE_LABELS[apt.type]}
          {parsed.specialty ? ` · ${parsed.specialty}` : ''}
        </p>
        {upcoming && parsed.bring && (
          <div className="mt-1.5 rounded-lg border border-coral/15 bg-coral/5 px-2.5 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-coral/90">
              Remember to bring
            </p>
            <p className="mt-0.5 text-[11.5px] italic leading-snug text-muted">{parsed.bring}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDelete(apt.id)}
        aria-label="Delete appointment"
        className="ml-1 text-muted/50 transition-colors hover:text-coral"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </motion.li>
  );
}

function parseAppointmentNotes(raw: string | undefined) {
  if (!raw) return { specialty: '', bring: '', extra: '' };
  const parts = raw
    .split(/\s*·\s*|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  let specialty = '';
  let bring = '';
  const extras: string[] = [];
  for (const p of parts) {
    if (/^(especialidad|specialty)[:\s]/i.test(p)) specialty = p.replace(/^(especialidad|specialty)[:\s]*/i, '').trim();
    else if (/^(llevar|bring)[:\s]/i.test(p)) bring = p.replace(/^(llevar|bring)[:\s]*/i, '').trim();
    else if (!specialty) specialty = p;
    else extras.push(p);
  }
  return { specialty, bring, extra: extras.join(' · ') };
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const tone = toneFor(item.type);
  const time = formatTime(item.ts);

  if (item.kind === 'appt') {
    const apt = item.appt;
    const parsed = parseAppointmentNotes(apt.notes);
    return (
      <motion.li
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-3 grid grid-cols-[44px_18px_1fr] items-start gap-x-2"
      >
        <span className="mt-1.5 text-right text-[11px] font-semibold tabular-nums text-muted/90">
          {apt.time ?? '—'}
        </span>
        <span className="relative flex h-[18px] justify-center">
          <span className={`mt-1.5 inline-block h-2.5 w-2.5 rounded-full ${tone.dot} ring-4 ring-background`} />
        </span>
        <div className="min-w-0 rounded-[16px] border border-coral/25 bg-white/95 px-3 py-2.5 shadow-soft">
          <div className="flex items-center gap-1.5">
            <span className={`flex h-5 w-5 items-center justify-center rounded-md ${tone.tint} ${tone.text}`}>
              {iconFor('appointment', 'h-3 w-3')}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${tone.text}`}>Appointment</span>
          </div>
          <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">{apt.title}</p>
          {parsed.specialty && (
            <p className="mt-0.5 text-[12px] leading-snug text-muted">{parsed.specialty}</p>
          )}
          {parsed.bring && (
            <div className="mt-2 rounded-lg border border-coral/15 bg-coral/5 px-2.5 py-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-coral/90">Remember to bring</p>
              <p className="mt-0.5 text-[12px] italic leading-snug text-muted">{parsed.bring}</p>
            </div>
          )}
          {parsed.extra && (
            <div className="mt-2 rounded-lg bg-background/70 px-2.5 py-1.5">
              <p className="whitespace-pre-wrap text-[12px] italic leading-snug text-muted">{parsed.extra}</p>
            </div>
          )}
        </div>
      </motion.li>
    );
  }

  const entry = item.entry;
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-3 grid grid-cols-[44px_18px_1fr] items-start gap-x-2"
    >
      <span className="mt-1.5 text-right text-[11px] font-semibold tabular-nums text-muted/90">{time}</span>
      <span className="relative flex h-[18px] justify-center">
        <span className={`mt-1.5 inline-block h-2.5 w-2.5 rounded-full ${tone.dot} ring-4 ring-background`} />
      </span>
      <div className="min-w-0 rounded-[16px] border border-hairline/70 bg-white/95 px-3 py-2.5 shadow-soft">
        <div className="flex items-center gap-1.5">
          <span className={`flex h-5 w-5 items-center justify-center rounded-md ${tone.tint} ${tone.text}`}>
            {iconFor(entry.type, 'h-3 w-3')}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${tone.text}`}>
            {TYPE_LABELS[entry.type] ?? entry.type}
          </span>
        </div>
        <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">{entry.label}</p>

        {entry.type === 'checkin' &&
          entry.value &&
          typeof entry.value === 'object' &&
          'proEnergy' in entry.value && (
            <p className="mt-1 text-[12px] text-sage">
              Energy {(entry.value as ProCheckInValue).proEnergy}/5 · Fog{' '}
              {(entry.value as ProCheckInValue).proBrainFog}/5
            </p>
          )}

        {entry.type === 'walking' && entry.durationMin != null && (
          <p className="mt-1 text-[12px] text-sky-600">⏱ {entry.durationMin} min</p>
        )}

        {entry.type === 'symptom' && entry.symptomTags && entry.symptomTags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entry.symptomTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-coral/20 bg-coral/10 px-2 py-0.5 text-[10px] text-coral"
              >
                {tag.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {entry.notes && (
          <div className="mt-2 rounded-lg bg-background/70 px-2.5 py-1.5">
            <p className="whitespace-pre-wrap text-[12px] italic leading-snug text-muted">{entry.notes}</p>
          </div>
        )}
      </div>
    </motion.li>
  );
}
