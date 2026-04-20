'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Aviso cuando hay una nueva versión del service worker (p. ej. tras un deploy).
 * Un toque recarga y aplica el bundle nuevo; sin desinstalar la PWA.
 */
export default function ServiceWorkerUpdateBanner() {
  const [visible, setVisible] = useState(false);
  const regRef = useRef<ServiceWorkerRegistration | null>(null);
  const dismissedRef = useRef(false);

  const applyUpdate = useCallback(() => {
    dismissedRef.current = false;
    // workbox/next-pwa suele usar skipWaiting en el SW; una recarga aplica el HTML/JS nuevos.
    window.location.reload();
  }, []);

  const dismiss = useCallback(() => {
    dismissedRef.current = true;
    setVisible(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const flagPending = () => {
      if (dismissedRef.current) return;
      setVisible(true);
    };

    function attachToInstalling(worker: ServiceWorker) {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          flagPending();
        }
      });
    }

    const wire = (reg: ServiceWorkerRegistration) => {
      if (regRef.current) return;
      regRef.current = reg;
      if (reg.waiting && navigator.serviceWorker.controller) {
        flagPending();
      }
      reg.addEventListener('updatefound', () => {
        const nw = regRef.current?.installing;
        if (nw) attachToInstalling(nw);
      });
    };

    const setup = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) wire(reg);
      } catch {
        /* ignore */
      }
    };

    void setup();

    const onLoad = () => {
      void navigator.serviceWorker.getRegistration().then((r) => {
        if (r) wire(r);
      });
    };
    window.addEventListener('load', onLoad);

    const ping = async () => {
      try {
        const reg = regRef.current ?? (await navigator.serviceWorker.getRegistration());
        if (!reg) return;
        regRef.current = reg;
        await reg.update();
      } catch {
        /* ignore */
      }
    };

    const onFocus = () => ping();
    const onVis = () => {
      if (document.visibilityState === 'visible') ping();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    // Primera comprobación al volver a la app
    ping();

    return () => {
      window.removeEventListener('load', onLoad);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[100] px-safe pt-[max(0.5rem,env(safe-area-inset-top,0px))]"
      role="alert"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2 rounded-2xl border border-sage/30 bg-surface/95 px-3 py-2.5 shadow-lift backdrop-blur-md">
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-ink">
          Hay una <span className="font-semibold">nueva versión</span> de la app. Actualiza para ver los últimos cambios.
        </p>
        <button
          type="button"
          onClick={applyUpdate}
          className="shrink-0 rounded-xl bg-sage px-3 py-2 text-xs font-semibold text-white shadow-soft active:scale-[0.98]"
        >
          Actualizar
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-xl px-2 py-2 text-[11px] font-medium text-muted underline-offset-2 hover:text-ink"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
}
