import { localDateISO } from '@/lib/dates';

const PREFIX = 'copiloto_checked_';

export function protocolCheckStorageKey(date = new Date()): string {
  return PREFIX + localDateISO(date);
}

export type ProtocolChecks = Record<string, boolean>;

export function loadProtocolChecks(date = new Date()): ProtocolChecks {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(protocolCheckStorageKey(date));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as ProtocolChecks) : {};
  } catch {
    return {};
  }
}
