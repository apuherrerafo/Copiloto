'use client';

import { APP_NAME } from '@/lib/brand';
import {
  getFastElapsed,
  getMinutesUntilEatingWindowCloses,
  getMinutesUntilFastDeadline,
  getProtocolSnapshot,
  isEatingWindow,
} from '@/lib/protocols/julio';
import { localDateISO } from '@/lib/dates';
import { getLogsByDate } from '@/lib/store/db';
import { readProtocolSettings } from '@/lib/protocols/user-protocol';

const TICK_MS = 45_000;
const LOG_REFRESH_MS = 120_000;

/**
 * Contextual nudges: fast ceiling, eating-window close, first-meal gap.
 * Same limits as scheduled alerts: needs Notification permission + JS running (tab/PWA open).
 * Not medical advice — adjunct to your clinician.
 */
export function startSmartCopilotAlerts(): () => void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') {
    return () => {};
  }

  let cancelled = false;
  let lastLogFetch = 0;
  let hasMealAfterWindowOpen = false;

  function storageKey(suffix: string): string {
    return `hypo-copilot-${suffix}`;
  }

  /** Returns true if we should show (first time for this key today). */
  function tryMark(suffix: string): boolean {
    try {
      const k = storageKey(suffix);
      if (sessionStorage.getItem(k)) return false;
      sessionStorage.setItem(k, '1');
      return true;
    } catch {
      return true;
    }
  }

  function push(title: string, body: string, tag: string, requireInteraction = false) {
    try {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        tag,
        requireInteraction,
      });
    } catch {
      /* ignore */
    }
  }

  const run = async () => {
    if (cancelled) return;
    const now = new Date();
    const date = localDateISO(now);
    const elapsed = getFastElapsed(now);
    const eating = isEatingWindow(now);
    const minToFastCap = getMinutesUntilFastDeadline(now);
    const minToEatClose = getMinutesUntilEatingWindowCloses(now);
    const proto = getProtocolSnapshot();
    const settings = readProtocolSettings();
    const maxH = proto.fast.maxHours;
    const breakH = settings.breakFastHour;

    if (Date.now() - lastLogFetch > LOG_REFRESH_MS) {
      lastLogFetch = Date.now();
      try {
        const logs = await getLogsByDate(date);
        const winOpen = new Date(now);
        winOpen.setHours(breakH, 0, 0, 0);
        hasMealAfterWindowOpen = logs.some(
          (l) => l.type === 'meal' && l.timestamp >= winOpen.getTime(),
        );
      } catch {
        hasMealAfterWindowOpen = false;
      }
    }

    // ── Inside eating window: first meal missing + fast ceiling ──
    if (eating && !hasMealAfterWindowOpen) {
      if (elapsed >= maxH) {
        const hourSlot = `${date}-h${now.getHours()}`;
        if (tryMark(`fast17-${hourSlot}`)) {
          push(
            `🛑 ${APP_NAME} — Past ${maxH} h fast`,
            `You are past the ${maxH} h mark without a logged meal. Break the fast with something light. Bring this pattern to your clinician — this app is a log, not a prescription.`,
            'hypo-copilot-fast17',
            true,
          );
        }
      } else if (minToFastCap > 0 && minToFastCap <= 30 && tryMark(`fastcap30-${date}`)) {
        push(
          `⚠️ ${APP_NAME} — ~${minToFastCap} min to fast ceiling`,
          `If you have not eaten yet, break your fast soon — crossing ${maxH} h often feels worse with hypothyroidism (energy, mood, stress hormones). Protein-forward first bite if you can.`,
          'hypo-copilot-fastcap',
          true,
        );
      } else if (elapsed >= 16 && elapsed < maxH && tryMark(`fast16band-${date}`)) {
        push(
          `⏱️ ${APP_NAME} — Long fast, still no meal logged`,
          `You are at ~${elapsed.toFixed(1)} h fasted. If you truly have not eaten, start your window — steady fuel usually beats stretching fasts when thyroid conversion is already sensitive.`,
          'hypo-copilot-fast16',
        );
      }
    }

    if (eating && minToEatClose !== null && minToEatClose <= 45 && minToEatClose >= 3 && tryMark(`eatclose-${date}`)) {
      const closeLabel = `${proto.eatingWindowEndHour}:00`;
      push(
        `🍽️ ${APP_NAME} — Eating window closing`,
        `About ${minToEatClose} min until ${closeLabel}. Closing on time keeps your overnight fast aligned with your plan — helpful for sleep and next-day levothyroxine timing.`,
        'hypo-copilot-eatclose',
      );
    }

    // ── Before eating window opens: morning awareness ──
    const h = now.getHours();
    if (!eating && h >= 10 && h < breakH && elapsed >= 14 && elapsed < 15.5 && tryMark(`preopen-${date}`)) {
      push(
        `🌤️ ${APP_NAME} — Eating window soon`,
        `Your eating window opens at ${breakH}:00. Hydrate and think protein + fat first after the pill window — steady fuel beats a sugar spike for thyroid-friendly days.`,
        'hypo-copilot-preopen',
      );
    }
  };

  const id = setInterval(() => void run(), TICK_MS);
  void run();

  return () => {
    cancelled = true;
    clearInterval(id);
  };
}
