'use client';

import { useEffect, useState } from 'react';
import { getAllLogs, type LogEntry, type ProCheckInValue } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';

type GroupedDay = {
  date: string;
  label: string;
  entries: LogEntry[];
};

const TYPE_ICONS: Record<string, string> = {
  meal: '🍽️',
  medication: '💊',
  symptom: '⚡',
  note: '📝',
  fast: '⏱️',
  walking: '🚶',
  checkin: '📊',
};

const MOODS = ['😞', '😕', '😐', '🙂', '😊'];
const MOOD_LABELS = ['Muy bajo', 'Bajo', 'Neutral', 'Bien', 'Muy bien'] as const;

const TYPE_LABELS: Record<string, string> = {
  meal: 'Comida',
  medication: 'Medicación',
  symptom: 'Síntoma',
  note: 'Nota',
  fast: 'Ayuno',
  walking: 'Caminata',
  checkin: 'Check-in PRO',
};

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const todayISO = localDateISO(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yestISO = localDateISO(yesterday);

  if (iso === todayISO) return 'Hoy';
  if (iso === yestISO) return 'Ayer';
  return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function HistorialPage() {
  const [days, setDays] = useState<GroupedDay[]>([]);
  const [loading, setLoading] = useState(true);

  function loadLogs(silent = false) {
    if (!silent) setLoading(true);
    getAllLogs().then((logs) => {
      const map = new Map<string, LogEntry[]>();
      for (const log of logs) {
        const arr = map.get(log.date) ?? [];
        arr.push(log);
        map.set(log.date, arr);
      }
      const sorted = [...map.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, entries]) => ({
          date,
          label: formatDateLabel(date),
          entries: entries.sort((a, b) => b.timestamp - a.timestamp),
        }));
      setDays(sorted);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadLogs(false);
    const onRefresh = () => loadLogs(true);
    window.addEventListener('copiloto-refresh', onRefresh);
    return () => window.removeEventListener('copiloto-refresh', onRefresh);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-serif italic text-3xl text-ink">Historial</h1>
      </div>

      <div className="px-6 pb-8">
        {loading && (
          <p className="text-gray-400 text-sm text-center py-12">Cargando...</p>
        )}

        {!loading && days.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 text-sm">Sin registros todavía</p>
            <p className="text-gray-300 text-xs mt-1">Empieza registrando tu primer evento</p>
          </div>
        )}

        {days.map((day) => (
          <div key={day.date} className="mb-6">
            <h2 className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-2 capitalize">
              {day.label}
            </h2>
            <div className="space-y-2">
              {day.entries.map((entry) => (
                <div
                  key={entry.id ?? `${entry.date}-${entry.timestamp}`}
                  className="bg-surface border border-hairline rounded-card px-4 py-3 flex items-start gap-3 shadow-soft"
                >
                  <span className="text-lg mt-0.5 shrink-0">{TYPE_ICONS[entry.type] ?? '•'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-sage bg-sage/10 px-2 py-0.5 rounded-full">
                        {TYPE_LABELS[entry.type] ?? entry.type}
                      </span>
                    </div>
                    <p className="text-ink text-sm font-medium leading-snug">{entry.label}</p>
                    {entry.type === 'checkin' &&
                      entry.value &&
                      typeof entry.value === 'object' &&
                      'proEnergy' in entry.value && (
                        <p className="text-xs text-sage mt-1 font-medium">
                          Energía {(entry.value as ProCheckInValue).proEnergy}/5 · Niebla/claridad{' '}
                          {(entry.value as ProCheckInValue).proBrainFog}/5
                        </p>
                      )}
                    {entry.type === 'walking' && entry.durationMin != null && (
                      <p className="text-xs text-sky-600 mt-1 font-medium">⏱ {entry.durationMin} min</p>
                    )}
                    {entry.type === 'symptom' && entry.symptomTags && entry.symptomTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {entry.symptomTags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-coral/10 text-coral border border-coral/20 px-2 py-0.5 rounded-full">
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                    {entry.notes && (
                      <p className="text-muted text-xs mt-1.5 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
                    )}
                    {entry.mood != null && entry.mood >= 1 && entry.mood <= 5 && (
                      <p className="text-xs text-muted mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-base">{MOODS[entry.mood - 1]}</span>
                        <span className="text-ink/80 font-medium">{MOOD_LABELS[entry.mood - 1]}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted/80 shrink-0 mt-0.5 font-mono tabular-nums">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
