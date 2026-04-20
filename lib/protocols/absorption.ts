import { LEVO_DOSE_LABEL } from '@/lib/brand';
import type { LogEntry } from '@/lib/store/db';

/** Separación mínima recomendada tras levotiroxina antes de café / comida que afecte absorción (producto, no prescripción). */
export const LEVO_ABSORPTION_MINUTES = 60;

const LEVO_PATTERNS = [
  /levotiroxina/i,
  /eutirox/i,
  /levoxyl/i,
  /eltroxin/i,
  /tirosint/i,
  new RegExp(LEVO_DOSE_LABEL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
  /\b\d+\s*mcg\b/i,
];

export function isLevothyroxineEntry(label: string): boolean {
  const t = label.trim();
  if (!t) return false;
  return LEVO_PATTERNS.some((p) => p.test(t));
}

/** Comidas / bebidas que deberían esperar la ventana post-levo. */
export function isAbsorptionSensitiveEntry(
  entryType: LogEntry['type'],
  label: string,
): boolean {
  if (entryType === 'meal') return true;
  const t = label.toLowerCase();
  if (entryType === 'medication') {
    if (isLevothyroxineEntry(label)) return false;
    return (
      /\b(calcio|calcium|antiácido|antiacido|hierro|iron|magnesio|multivit|vitamina)\b/i.test(t) ||
      /\b(ibuprofeno|paracetamol)\b/i.test(t)
    );
  }
  return false;
}

function lastLevoTimestampBefore(
  logs: LogEntry[],
  date: string,
  beforeMs: number,
): number | null {
  let best: number | null = null;
  for (const e of logs) {
    if (e.date !== date) continue;
    if (e.type !== 'medication') continue;
    if (!isLevothyroxineEntry(e.label)) continue;
    if (e.timestamp > beforeMs) continue;
    if (best === null || e.timestamp > best) best = e.timestamp;
  }
  return best;
}

export type AbsorptionConflict = {
  minutesElapsed: number;
  minutesRequired: number;
  minutesRemaining: number;
  levoTimeLabel: string;
};

/**
 * Si hay levotiroxina reciente, avisa al guardar comida u otros fármacos que interfieren
 * antes de cumplir la ventana (p. ej. 60 min).
 */
export function getAbsorptionConflict(
  logs: LogEntry[],
  date: string,
  proposedTimestampMs: number,
  entryType: LogEntry['type'],
  label: string,
): AbsorptionConflict | null {
  if (!isAbsorptionSensitiveEntry(entryType, label)) return null;

  const levoAt = lastLevoTimestampBefore(logs, date, proposedTimestampMs);
  if (levoAt === null) return null;

  const elapsedMin = (proposedTimestampMs - levoAt) / 60_000;
  const required = LEVO_ABSORPTION_MINUTES;
  if (elapsedMin >= required - 0.01) return null;

  return {
    minutesElapsed: Math.max(0, elapsedMin),
    minutesRequired: required,
    minutesRemaining: Math.max(0, required - elapsedMin),
    levoTimeLabel: new Date(levoAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
}
