'use client';

interface ProtocolNotification {
  hour: number;
  minute: number;
  title: string;
  body: string;
  tag: string;
}

const PROTOCOL_NOTIFICATIONS: ProtocolNotification[] = [
  { hour: 10, minute: 55, title: '💊 Copiloto', body: 'En 5 min: Levotiroxina 75mcg con agua pura. No café todavía.', tag: 'levotiroxina' },
  { hour: 12, minute:  0, title: '🍽️ Copiloto', body: '¡Hora de romper el ayuno! Tu pastilla ya se absorbió. Rompe con algo suave.', tag: 'fastbreak' },
  { hour: 19, minute: 45, title: '⏰ Copiloto', body: 'Última oportunidad de comer (15 min). A las 8PM inicia tu ayuno.', tag: 'lastmeal' },
];

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleProtocolNotifications(): () => void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return () => {};

  const timers: ReturnType<typeof setTimeout>[] = [];
  const now = new Date();

  for (const notif of PROTOCOL_NOTIFICATIONS) {
    const target = new Date(now);
    target.setHours(notif.hour, notif.minute, 0, 0);

    if (target > now) {
      const delay = target.getTime() - now.getTime();
      const timer = setTimeout(() => {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/icons/icon-192.png',
          tag: notif.tag,
          requireInteraction: false,
        });
      }, delay);
      timers.push(timer);
    }
  }

  return () => timers.forEach(clearTimeout);
}

export function scheduleFastLimitAlert(fastElapsedHours: number): (() => void) | null {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return null;
  const max = 17;
  if (fastElapsedHours >= max) return null;

  const remaining = (max - fastElapsedHours) * 3600 * 1000;
  const timer = setTimeout(() => {
    new Notification('⚠️ Copiloto — Límite de ayuno', {
      body: '¡Llevas 17 horas en ayuno! Rompe ya con algo ligero. No te conviene más.',
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
