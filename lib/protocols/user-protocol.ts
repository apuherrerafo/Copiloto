import { LEVO_DOSE_LABEL } from '@/lib/brand';

/**
 * User-editable schedule — must stay aligned with your clinician.
 * Defaults match the original Julio template (16:8, 17h ceiling, 11:00 levo).
 */
export type UserProtocolSettings = {
  /** When the overnight fast typically starts (last meal ~hour). */
  eveningFastStartHour: number;
  /** Earliest meal / break-fast time. */
  breakFastHour: number;
  /** Last meal — eating window closes (same calendar day). */
  eatingWindowEndHour: number;
  /** Hard ceiling for fasting duration (hours from evening fast start). */
  maxFastHours: number;
  /** Target fasting hours (ring / UX). */
  targetFastHours: number;
  levoHour: number;
  levoMinute: number;
};

export const DEFAULT_PROTOCOL_SETTINGS: UserProtocolSettings = {
  eveningFastStartHour: 20,
  breakFastHour: 12,
  eatingWindowEndHour: 20,
  maxFastHours: 17,
  targetFastHours: 16,
  levoHour: 11,
  levoMinute: 0,
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function sanitizeProtocolSettings(p: Partial<UserProtocolSettings>): UserProtocolSettings {
  const d = { ...DEFAULT_PROTOCOL_SETTINGS };
  if (typeof p.eveningFastStartHour === 'number')
    d.eveningFastStartHour = clamp(Math.round(p.eveningFastStartHour), 16, 23);
  if (typeof p.breakFastHour === 'number') d.breakFastHour = clamp(Math.round(p.breakFastHour), 5, 14);
  if (typeof p.eatingWindowEndHour === 'number')
    d.eatingWindowEndHour = clamp(Math.round(p.eatingWindowEndHour), 17, 23);
  if (typeof p.maxFastHours === 'number') d.maxFastHours = clamp(Math.round(p.maxFastHours), 12, 22);
  if (typeof p.targetFastHours === 'number') d.targetFastHours = clamp(Math.round(p.targetFastHours), 12, 20);
  if (typeof p.levoHour === 'number') d.levoHour = clamp(Math.round(p.levoHour), 4, 14);
  if (typeof p.levoMinute === 'number') d.levoMinute = clamp(Math.round(p.levoMinute), 0, 59);

  if (d.breakFastHour >= d.eatingWindowEndHour) {
    d.eatingWindowEndHour = Math.min(23, d.breakFastHour + 8);
  }
  if (d.targetFastHours >= d.maxFastHours) {
    d.targetFastHours = Math.max(12, d.maxFastHours - 1);
  }
  return d;
}

/**
 * Smart defaults anchored to the device's current time.
 * Used only when the user has never saved a custom schedule.
 *
 * Logic:
 *   levo   = current hour (if 05–13) rounded to :00/:30, else 08:00
 *   break  = levo + 1 h  (minimum absorption window)
 *   close  = break + 8 h (standard 16:8)
 *   target = 24 - eating-window duration
 *   max    = target + 1
 */
export function getSmartDefaultSettings(): UserProtocolSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_PROTOCOL_SETTINGS };
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  const levoHour = h >= 5 && h <= 13 ? h : 8;
  const levoMinute = h >= 5 && h <= 13 ? (m >= 30 ? 30 : 0) : 0;

  const breakFastHour = Math.min(14, levoHour + 1);
  const eatingWindowEndHour = Math.min(22, breakFastHour + 8);
  const eveningFastStartHour = eatingWindowEndHour;
  const targetFastHours = 24 - (eatingWindowEndHour - breakFastHour);
  const maxFastHours = Math.min(22, targetFastHours + 1);

  return sanitizeProtocolSettings({
    levoHour,
    levoMinute,
    breakFastHour,
    eatingWindowEndHour,
    eveningFastStartHour,
    targetFastHours,
    maxFastHours,
  });
}

export function readProtocolSettings(): UserProtocolSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_PROTOCOL_SETTINGS };
  try {
    const raw = localStorage.getItem('copiloto_profile');
    if (!raw) return { ...DEFAULT_PROTOCOL_SETTINGS };
    const parsed = JSON.parse(raw) as { protocolSettings?: Partial<UserProtocolSettings> };
    if (parsed.protocolSettings && typeof parsed.protocolSettings === 'object') {
      return sanitizeProtocolSettings(parsed.protocolSettings);
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_PROTOCOL_SETTINGS };
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/** One-line summary for the chat API (English). */
export function formatProtocolForPrompt(): string {
  const s = readProtocolSettings();
  return [
    `Levothyroxine around ${pad2(s.levoHour)}:${pad2(s.levoMinute)} (water, fasting).`,
    `Eating window ~${s.breakFastHour}:00–${s.eatingWindowEndHour}:00 local.`,
    `Target fast ~${s.targetFastHours} h, do not stretch past ~${s.maxFastHours} h without clinician guidance.`,
    `Overnight fast clock starts ~${s.eveningFastStartHour}:00 (after last meal).`,
  ].join(' ');
}
