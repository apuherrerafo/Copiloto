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

interface LogEntry {
  id?: number;
  date: string;         // ISO date YYYY-MM-DD (local)
  timestamp: number;    // Unix ms (UTC)
  type: 'meal' | 'medication' | 'fast' | 'symptom' | 'note' | 'walking';
  label: string;
  value?: string | number;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  /** Duration in minutes — applies to 'walking' type */
  durationMin?: number;
  /** Structured symptom tags — applies to 'symptom' type */
  symptomTags?: SymptomTag[];
}

interface BodyEntry {
  id?: number;
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
  const db = await getDB();
  return db.add('logs', entry);
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
  const db = await getDB();
  return db.add('body', entry);
}

export async function getBodyByDate(date: string): Promise<BodyEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('body', 'by-date', date);
}

export async function getAllBodyEntries(): Promise<BodyEntry[]> {
  const db = await getDB();
  return db.getAll('body');
}

export type { LogEntry, BodyEntry };
