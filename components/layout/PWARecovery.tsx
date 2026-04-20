'use client';

import { useEffect } from 'react';

/**
 * Localhost: borra caches de Workbox y desregistra SW.
 * Un SW de un build viejo hace que `/_next/static/*` falle → 404 en main-app.js y pantalla en blanco.
 * Si había SW, recarga una vez para pedir los chunks al servidor sin interceptación.
 */
export default function PWARecovery() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = window.location.hostname;
    if (h !== 'localhost' && h !== '127.0.0.1') return;

    let cancelled = false;

    void (async () => {
      try {
        const keys = await caches?.keys?.();
        if (keys?.length) {
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        const regs = await navigator.serviceWorker?.getRegistrations?.();
        const hadSw = !!regs?.length;
        if (regs?.length) {
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if (!cancelled && hadSw) {
          window.location.reload();
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
