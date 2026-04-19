'use client';

import { useEffect, useState } from 'react';
import { getAllLogs, type LogEntry } from '@/lib/store/db';

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
};

const MOODS = ['😞', '😕', '😐', '🙂', '😊'];

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yestISO = yesterday.toISOString().slice(0, 10);

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

  useEffect(() => {
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
                  key={entry.id}
                  className="bg-surface border border-gray-100 rounded-2xl px-4 py-3 flex items-start gap-3"
                >
                  <span className="text-lg mt-0.5">{TYPE_ICONS[entry.type] ?? '•'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-sm font-medium leading-snug">{entry.label}</p>
                    {entry.notes && (
                      <p className="text-gray-400 text-xs mt-0.5 leading-snug">{entry.notes}</p>
                    )}
                    {entry.mood && (
                      <span className="text-sm mt-1 inline-block">{MOODS[entry.mood - 1]}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-300 shrink-0 mt-0.5">
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
