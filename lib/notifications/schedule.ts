'use client';

import { APP_NAME, LEVO_DOSE_LABEL } from '@/lib/brand';

interface ProtocolNotification {
  hour: number;
  minute: number;
  title: string;
  body: string;
  tag: string;
}

/** Cada aviso: acción + micro-lección clínica (matriz Gemini Deep Research). */
const PROTOCOL_NOTIFICATIONS: ProtocolNotification[] = [
  {
    hour: 8,
    minute: 0,
    title: `🌅 ${APP_NAME} — Buenos días`,
    body: `Revisa el resumen de ayer. La adherencia diaria acumula: cada toma puntual de levotiroxina sostiene niveles estables de T4 sérica y, tras ~4 semanas, TSH dentro de rango. Un día perfecto no existe, pero la constancia sí.`,
    tag: 'morning-open',
  },
  {
    hour: 10,
    minute: 55,
    title: `💊 ${APP_NAME} — Pastilla en 5 min`,
    body: `Levotiroxina ${LEVO_DOSE_LABEL} con 200 ml de agua. Sin cafeína ni calcio por 60 min. ¿Por qué? El ambiente gástrico ácido sin competidores puede llevar la absorción hasta el 80 %; el café la reduce un 27–36 %.`,
    tag: 'levotiroxina',
  },
  {
    hour: 12,
    minute: 0,
    title: `🍽️ ${APP_NAME} — Ventana abierta`,
    body: 'Rompe el ayuno. Proteínas y grasas saludables apoyan la conversión periférica T4→T3 (activa). Evita carbohidratos simples solos: elevan insulina sin soporte de macros y generan el "crash" que sientes a las 2 h.',
    tag: 'fastbreak',
  },
  {
    hour: 13,
    minute: 45,
    title: `🚶 ${APP_NAME} — Caminata post-almuerzo`,
    body: '10–15 min ahora. La contracción muscular transloca transportadores GLUT4 a la membrana celular de forma independiente a la insulina, bajando el pico glucémico posprandial un 12–18 %. Sin zapatillas especiales.',
    tag: 'walk-lunch-nudge',
  },
  {
    hour: 19,
    minute: 45,
    title: `⏰ ${APP_NAME} — Cierre de ventana en 15 min`,
    body: 'A las 20:00 empieza el ayuno. Cerrar a tiempo sincroniza insulina con el reloj circadiano periférico del hígado. Después de las 20 h la sensibilidad insulínica baja fisiológicamente: comer tarde tiene mayor impacto glucémico.',
    tag: 'lastmeal',
  },
  {
    hour: 20,
    minute: 15,
    title: `🚶 ${APP_NAME} — Caminata post-cena`,
    body: '15–20 min de caminata suave. Estimula el sistema parasimpático, mejora la digestión y reduce la glucosa residual antes del ayuno nocturno. Evita intensidad alta: elevaría cortisol y dificultaría el inicio del sueño.',
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
