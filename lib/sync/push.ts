import type { LogEntry, BodyEntry } from '@/lib/store/db';

async function post(body: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pushLogEntry(entry: LogEntry): Promise<void> {
  if (typeof window === 'undefined' || !entry.clientId) return;
  await post({
    logs: [
      {
        clientId: entry.clientId,
        date: entry.date,
        timestamp: entry.timestamp,
        type: entry.type,
        label: entry.label,
        value: entry.value,
        mood: entry.mood,
        notes: entry.notes,
        durationMin: entry.durationMin,
        symptomTags: entry.symptomTags,
      },
    ],
  });
}

export async function pushBodyEntry(entry: BodyEntry): Promise<void> {
  if (typeof window === 'undefined' || !entry.clientId) return;
  await post({
    body: [
      {
        clientId: entry.clientId,
        date: entry.date,
        weight: entry.weight,
        waist: entry.waist,
        notes: entry.notes,
      },
    ],
  });
}

export async function pushProfileAndProtocol(profile: unknown, protocolChecks: Record<string, Record<string, boolean>>): Promise<void> {
  if (typeof window === 'undefined') return;
  await post({ profile, protocolChecks });
}
