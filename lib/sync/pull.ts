import { getDB } from '@/lib/store/db';
import type { LogEntry, BodyEntry, SymptomTag, ProCheckInValue } from '@/lib/store/db';

function mapValueJson(raw: unknown): LogEntry['value'] {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  if (typeof raw === 'object' && raw !== null && 'proEnergy' in raw && 'proBrainFog' in raw) {
    const o = raw as Record<string, unknown>;
    const pe = Number(o.proEnergy);
    const pb = Number(o.proBrainFog);
    if (Number.isFinite(pe) && Number.isFinite(pb)) {
      return { proEnergy: pe, proBrainFog: pb } as ProCheckInValue;
    }
  }
  return undefined;
}

function mapLogRow(row: Record<string, unknown>): Omit<LogEntry, 'id'> {
  const tags = row.symptom_tags as string[] | null;
  return {
    clientId: row.client_id as string,
    date: String(row.date),
    timestamp: Number(row.timestamp_ms),
    type: row.type as LogEntry['type'],
    label: String(row.label),
    value: mapValueJson(row.value_json),
    mood: row.mood != null ? (Number(row.mood) as 1 | 2 | 3 | 4 | 5) : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    durationMin: row.duration_min != null ? Number(row.duration_min) : undefined,
    symptomTags: Array.isArray(tags) ? (tags as SymptomTag[]) : undefined,
  };
}

function mapBodyRow(row: Record<string, unknown>): Omit<BodyEntry, 'id'> {
  return {
    clientId: row.client_id as string,
    date: String(row.date),
    weight: row.weight != null ? Number(row.weight) : undefined,
    waist: row.waist != null ? Number(row.waist) : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
  };
}

/** Descarga el estado remoto y reemplaza el almacenamiento local (misma cuenta en otro teléfono). */
export async function pullRemoteAndApply(): Promise<void> {
  if (typeof window === 'undefined') return;

  const res = await fetch('/api/sync', { credentials: 'include' });
  if (!res.ok) return;

  const data = (await res.json()) as {
    configured?: boolean;
    logs?: Record<string, unknown>[];
    body?: Record<string, unknown>[];
    profile?: unknown;
    protocolChecks?: Record<string, Record<string, boolean>> | null;
  };

  if (!data.configured) return;

  const db = await getDB();
  await db.clear('logs');
  await db.clear('body');

  for (const row of data.logs ?? []) {
    await db.add('logs', mapLogRow(row) as LogEntry);
  }
  for (const row of data.body ?? []) {
    await db.add('body', mapBodyRow(row) as BodyEntry);
  }

  if (data.profile != null) {
    try {
      localStorage.setItem('copiloto_profile', JSON.stringify(data.profile));
    } catch {
      /* ignore */
    }
  }

  if (data.protocolChecks && typeof data.protocolChecks === 'object') {
    for (const [date, checks] of Object.entries(data.protocolChecks)) {
      try {
        localStorage.setItem(`copiloto_checked_${date}`, JSON.stringify(checks));
      } catch {
        /* ignore */
      }
    }
  }

  window.dispatchEvent(new Event('copiloto-refresh'));
  window.dispatchEvent(new CustomEvent('hypo-storage-sync'));
}
