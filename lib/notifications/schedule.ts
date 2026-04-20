'use client';

import { APP_NAME, LEVO_DOSE_LABEL } from '@/lib/brand';

interface ProtocolNotification {
  hour: number;
  minute: number;
  title: string;
  body: string;
  tag: string;
}

/**
 * Notificaciones estilo "¿Sabías que?" — lenguaje accesible, tono Ray Ramis
 * (biohacking práctico + conexión al hipotiroidismo, sin jerga técnica).
 */
const PROTOCOL_NOTIFICATIONS: ProtocolNotification[] = [
  {
    hour: 8,
    minute: 0,
    title: `🌅 ${APP_NAME} — Good morning!`,
    body: `Did you know 10 minutes of morning sunlight raises vitamin D, lowers cortisol and lifts your mood? With hypothyroidism this matters even more: high cortisol blocks your pill from working well. Step out onto the balcony if that’s all you can do. Check today’s protocol.`,
    tag: 'morning-open',
  },
  {
    hour: 10,
    minute: 55,
    title: `💊 ${APP_NAME} — Your pill in 5 min`,
    body: `Did you know taking levothyroxine on an empty stomach can roughly double how much your body absorbs versus taking it with coffee? No caffeine, no milk, no supplements for 60 min. Just water. A tiny habit with a huge impact on how you feel all day.`,
    tag: 'levotiroxina',
  },
  {
    hour: 12,
    minute: 0,
    title: `🍽️ ${APP_NAME} — Open your window`,
    body: `Did you know after hours of fasting your body is primed to absorb nutrients well? Eat protein + healthy fat first. That gives your thyroid the "bricks" it needs to turn the pill into real energy. Avoid pure carbs — the 2-hour crash is real.`,
    tag: 'fastbreak',
  },
  {
    hour: 13,
    minute: 45,
    title: `🚶 ${APP_NAME} — Walk for 10 minutes`,
    body: `Did you know walking right after a meal makes your muscles absorb glucose without needing insulin? With hypothyroidism your metabolism is already slow — this walk is like an express turbo for your afternoon energy. No special shoes, no excuses.`,
    tag: 'walk-lunch-nudge',
  },
  {
    hour: 19,
    minute: 45,
    title: `⏰ ${APP_NAME} — Close your window in 15 min`,
    body: `Did you know eating very late desynchronizes your circadian clock? At that hour the same plate can hit your metabolism harder. Close at 8:00 PM. Your liver and thyroid rest better when the fast starts on time.`,
    tag: 'lastmeal',
  },
  {
    hour: 20,
    minute: 15,
    title: `🚶 ${APP_NAME} — Gentle post-dinner walk`,
    body: `Did you know a calm 15-minute walk activates your nervous system’s "rest mode"? It improves digestion, stabilizes blood sugar for the overnight fast and prepares deep sleep. Don’t rush or push hard — that would raise cortisol and delay sleep.`,
    tag: 'walk-dinner-nudge',
  },
];

const protocolTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearProtocolTimers() {
  protocolTimers.forEach(clearTimeout);
  protocolTimers.clear();
}

function nextOccurrenceLocal(hour: number, minute: number, from = new Date()): Date {
  const d = new Date(from);
  d.setSeconds(0, 0);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= from.getTime()) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function scheduleOne(notif: ProtocolNotification): void {
  const loop = () => {
    const next = nextOccurrenceLocal(notif.hour, notif.minute);
    const delay = Math.max(2_000, next.getTime() - Date.now());
    const id = setTimeout(() => {
      try {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/icons/icon-192.png',
          tag: `${notif.tag}-${next.getTime()}`,
          requireInteraction: false,
        });
      } catch {
        /* ignore */
      }
      loop();
    }, delay);
    protocolTimers.set(notif.tag, id);
  };
  loop();
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleProtocolNotifications(): () => void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') {
    return () => {};
  }

  clearProtocolTimers();
  for (const notif of PROTOCOL_NOTIFICATIONS) {
    scheduleOne(notif);
  }

  return clearProtocolTimers;
}

export function scheduleFastLimitAlert(fastElapsedHours: number): (() => void) | null {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return null;
  const max = 17;
  if (fastElapsedHours >= max) return null;

  const remaining = (max - fastElapsedHours) * 3600 * 1000;
  const timer = setTimeout(() => {
    new Notification(`⚠️ ${APP_NAME} — Fast limit`, {
      body: '17h: your liver is already mobilizing a lot of endogenous glucose; break it with something light. Prolonged fasting is not a substitute for medical evaluation.',
      icon: '/icons/icon-192.png',
      tag: 'fast-limit',
      requireInteraction: true,
    });
  }, remaining);

  return () => clearTimeout(timer);
}

export function getNotificationStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as 'granted' | 'denied' | 'default';
}

/**
 * Instant smoke test: verifies OS/browser actually shows a notification.
 * Scheduled protocol alerts use `setTimeout`, so they only fire while this tab
 * (or PWA) can run JavaScript — closing the app means no timers until you open again.
 */
export function sendTestNotification():
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'not_granted' | 'error' } {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { ok: false, reason: 'unsupported' };
  }
  if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'not_granted' };
  }
  try {
    new Notification(`Test — ${APP_NAME}`, {
      body:
        'If you see this, permissions are OK. Timed reminders need the app open in the background; they are not server push.',
      icon: '/icons/icon-192.png',
      tag: 'hypo-test-notification',
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
