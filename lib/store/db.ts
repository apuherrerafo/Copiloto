import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

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

export interface LogEntry {
  id?: number;
  /** UUID estable para sincronizar con Supabase (misma fila en todos los dispositivos) */
  clientId?: string;
  date: string;
  timestamp: number;
  type: 'meal' | 'medication' | 'fast' | 'symptom' | 'note' | 'walking' | 'checkin';
  label: string;
  value?: string | number | ProCheckInValue;
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

export async function getAllLogs(): Promise<LogEntry[]> {
  const db = await getDB();
  return db.getAll('logs');
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
