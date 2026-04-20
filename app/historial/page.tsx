'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { getAllLogs, type LogEntry, type ProCheckInValue } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';

type FilterKey = 'all' | 'medication' | 'meal' | 'symptom' | 'walking' | 'checkin' | 'note';

const FILTER_ORDER: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'medication', label: 'Medicación' },
  { key: 'meal', label: 'Comidas' },
  { key: 'symptom', label: 'Síntomas' },
  { key: 'walking', label: 'Caminatas' },
  { key: 'checkin', label: 'Check-in' },
  { key: 'note', label: 'Notas' },
];

const TYPE_LABELS: Record<string, string> = {
  meal: 'Comida',
  medication: 'Medicación',
  symptom: 'Síntoma',
  note: 'Nota',
  fast: 'Ayuno',
  walking: 'Caminata',
  checkin: 'Check-in',
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

  if (iso === todayISO) {
    const rest = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    return `Hoy, ${rest}`;
  }
  if (iso === yestISO) {
    const rest = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    return `Ayer, ${rest}`;
  }
  return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

type GroupedDay = { date: string; label: string; entries: LogEntry[] };

export default function HistorialPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  function loadLogs(silent = false) {
    if (!silent) setLoading(true);
    getAllLogs().then((all) => {
      setLogs(all);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadLogs(false);
    const onRefresh = () => loadLogs(true);
    window.addEventListener('copiloto-refresh', onRefresh);
    return () => window.removeEventListener('copiloto-refresh', onRefresh);
  }, []);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: logs.length,
      medication: 0,
      meal: 0,
      symptom: 0,
      walking: 0,
      checkin: 0,
      note: 0,
    };
    for (const l of logs) {
      if (l.type in c) c[l.type as FilterKey]++;
    }
    return c;
  }, [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (filter !== 'all' && l.type !== filter) return false;
      if (!q) return true;
      const hay =
        (l.label ?? '').toLowerCase() +
        ' ' +
        (l.notes ?? '').toLowerCase() +
        ' ' +
        (l.symptomTags ?? []).join(' ');
      return hay.includes(q);
    });
  }, [logs, filter, query]);

  const days: GroupedDay[] = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    for (const log of filtered) {
      const arr = map.get(log.date) ?? [];
      arr.push(log);
      map.set(log.date, arr);
    }
    return [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, entries]) => ({
        date,
        label: formatDateLabel(date),
        entries: entries.sort((a, b) => b.timestamp - a.timestamp),
      }));
  }, [filtered]);

  return (
    <div className="home-mesh min-h-screen">
      <div className="px-safe pt-10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted/80">Tu historial</p>
        <h1 className="mt-1 font-serif text-[2.25rem] italic leading-[1.05] text-ink">
          Todo lo que <span className="text-sage">cuidaste de ti</span>
        </h1>
      </div>

      <div className="px-safe">
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
            placeholder="Buscar en tu historial…"
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
              <button
                key={key}
                onClick={() => setFilter(key)}
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
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-safe pb-nav-clear mt-5">
        {loading && <p className="py-12 text-center text-sm text-muted">Cargando…</p>}

        {!loading && days.length === 0 && (
          <div className="py-16 text-center">
            <p className="mb-3 text-4xl">📋</p>
            <p className="text-sm text-muted">Sin registros todavía</p>
            <p className="mt-1 text-xs text-muted/70">Empieza tocando el + verde para registrar</p>
          </div>
        )}

        {days.map((day) => (
          <section key={day.date} className="mb-7">
            <h2 className="mb-3 font-serif text-[15px] italic capitalize text-coral">{day.label}</h2>

            <ul className="relative">
              <span
                aria-hidden
                className="absolute left-[52px] top-1 bottom-1 w-px bg-hairline/90"
              />
              {day.entries.map((entry, idx) => (
                <TimelineRow key={entry.id ?? `${entry.date}-${entry.timestamp}-${idx}`} entry={entry} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ entry }: { entry: LogEntry }) {
  const tone = toneFor(entry.type);
  const time = formatTime(entry.timestamp);
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
              Energía {(entry.value as ProCheckInValue).proEnergy}/5 · Niebla{' '}
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
