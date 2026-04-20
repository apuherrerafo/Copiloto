import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { addDaysLocal, localDateISO } from '@/lib/dates';

export type SymptomTag =
  | 'fatiga'
  | 'frio'
  | 'niebla_mental'
  | 'estreñimiento'
  | 'palpitaciones'
  | 'ansiedad'
  | 'dolor_cabeza'
  | 'insomnio'
  | 'otro';

/** Valor estructurado para check-in PRO (sincroniza en value_json). */
export type ProCheckInValue = { proEnergy: number; proBrainFog: number };

/** Evening PROM: digestive + perceived energy + clarity (1–5). */
export type EveningPROMValue = { pmDigestive: number; pmEnergy: number; pmClarity: number };

export interface LogEntry {
  id?: number;
  /** UUID estable para sincronizar con Supabase (misma fila en todos los dispositivos) */
  clientId?: string;
  date: string;
  timestamp: number;
  type: 'meal' | 'medication' | 'fast' | 'symptom' | 'note' | 'walking' | 'checkin';
  label: string;
  value?: string | number | ProCheckInValue | EveningPROMValue;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  durationMin?: number;
  symptomTags?: SymptomTag[];
}

export interface BodyEntry {
  id?: number;
  clientId?: string;
  date: string;
  weight?: number;
  waist?: number;
  notes?: string;
}

interface CopiloSchema extends DBSchema {
  logs: {
    key: number;
    value: LogEntry;
    indexes: { 'by-date': string };
  };
  body: {
    key: number;
    value: BodyEntry;
    indexes: { 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<CopiloSchema>> | null = null;

function newClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CopiloSchema>('copiloto-db', 1, {
      upgrade(db) {
        const logs = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
        logs.createIndex('by-date', 'date');

        const body = db.createObjectStore('body', { keyPath: 'id', autoIncrement: true });
        body.createIndex('by-date', 'date');
      },
    });
  }
  return dbPromise;
}

export async function addLog(entry: Omit<LogEntry, 'id'>) {
  const clientId = entry.clientId ?? newClientId();
  const row = { ...entry, clientId };
  const db = await getDB();
  const id = await db.add('logs', row as LogEntry);
  invalidateLogsCache();
  if (typeof window !== 'undefined') {
    void import('@/lib/sync/push').then(({ pushLogEntry }) =>
      pushLogEntry({ ...(row as LogEntry), id: id as number }),
    );
  }
  return id;
}

export async function getLogsByDate(date: string): Promise<LogEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('logs', 'by-date', date);
}

/** Last N calendar days including today (local), merged log list (newest days first in iteration). */
export async function getLogsForLastNDays(n: number, now = new Date()): Promise<LogEntry[]> {
  const out: LogEntry[] = [];
  for (let i = 0; i < n; i++) {
    const iso = localDateISO(addDaysLocal(now, -i));
    const day = await getLogsByDate(iso);
    out.push(...day);
  }
  return out;
}

let _logsCache: { data: LogEntry[]; at: number } | null = null;
const LOGS_CACHE_TTL = 30_000;

export async function getAllLogs(): Promise<LogEntry[]> {
  if (_logsCache && Date.now() - _logsCache.at < LOGS_CACHE_TTL) {
    return _logsCache.data;
  }
  const db = await getDB();
  const data = await db.getAll('logs');
  _logsCache = { data, at: Date.now() };
  return data;
}

export function invalidateLogsCache(): void {
  _logsCache = null;
}

export async function addBodyEntry(entry: Omit<BodyEntry, 'id'>) {
  const clientId = entry.clientId ?? newClientId();
  const row = { ...entry, clientId };
  const db = await getDB();
  const id = await db.add('body', row as BodyEntry);
  if (typeof window !== 'undefined') {
    void import('@/lib/sync/push').then(({ pushBodyEntry }) =>
      pushBodyEntry({ ...(row as BodyEntry), id: id as number }),
    );
  }
  return id;
}

export async function getBodyByDate(date: string): Promise<BodyEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('body', 'by-date', date);
}

export async function getAllBodyEntries(): Promise<BodyEntry[]> {
  const db = await getDB();
  return db.getAll('body');
}
