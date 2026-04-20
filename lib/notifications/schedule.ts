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
    title: `🌅 ${APP_NAME} — ¡Buenos días!`,
    body: `¿Sabías que 10 minutos de sol por la mañana suben la vitamina D, bajan el cortisol y mejoran el ánimo? Con hipotiroidismo esto importa el doble: el cortisol alto bloquea que tu pastilla funcione bien. Sal aunque sea al balcón. Revisa tu protocolo de hoy.`,
    tag: 'morning-open',
  },
  {
    hour: 10,
    minute: 55,
    title: `💊 ${APP_NAME} — Tu pastilla en 5 min`,
    body: `¿Sabías que tomar la levotiroxina con el estómago vacío puede doblar la cantidad que absorbe tu cuerpo vs. tomarla con café? Sin cafeína, sin leche, sin suplementos por 60 min. Solo agua. Un pequeño hábito que hace una diferencia enorme en cómo te sientes todo el día.`,
    tag: 'levotiroxina',
  },
  {
    hour: 12,
    minute: 0,
    title: `🍽️ ${APP_NAME} — Abre tu ventana`,
    body: `¿Sabías que después de horas de ayuno tu cuerpo está listo para aprovechar bien los nutrientes? Come proteína + grasa sana primero. Eso le da a tu tiroides los "ladrillos" que necesita para convertir la pastilla en energía real. Evita solo carbohidratos: el bajón de las 2 h es real.`,
    tag: 'fastbreak',
  },
  {
    hour: 13,
    minute: 45,
    title: `🚶 ${APP_NAME} — Camina 10 minutos`,
    body: `¿Sabías que caminar justo después de comer hace que tus músculos absorban el azúcar sin depender de insulina? Con hipotiroidismo el metabolismo ya va lento — esta caminata es como darle un turbo express a tu energía de la tarde. Sin zapatillas especiales, sin excusas.`,
    tag: 'walk-lunch-nudge',
  },
  {
    hour: 19,
    minute: 45,
    title: `⏰ ${APP_NAME} — Cierra la ventana en 15 min`,
    body: `¿Sabías que comer de noche le dice a tu cuerpo que no es de noche? Tu reloj interno se desincroniza y engorda más con la misma comida. A las 20:00 cierra. Tu hígado y tu tiroides descansan mejor cuando el ayuno empieza a su hora. Eso es biohacking sin gastar nada.`,
    tag: 'lastmeal',
  },
  {
    hour: 20,
    minute: 15,
    title: `🚶 ${APP_NAME} — Caminata suave post-cena`,
    body: `¿Sabías que una caminata tranquila de 15 min activa el "modo descanso" de tu sistema nervioso? Mejora la digestión, estabiliza el azúcar para el ayuno nocturno y prepara el sueño profundo. No corras, no te agites — eso elevaría el cortisol y tardarías más en dormirte.`,
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
    new Notification(`⚠️ ${APP_NAME} — Límite de ayuno`, {
      body: '17 h: el hígado ya moviliza mucha glucosa endógena; rompe con algo ligero. El ayuno prolongado no sustituye valoración médica.',
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
