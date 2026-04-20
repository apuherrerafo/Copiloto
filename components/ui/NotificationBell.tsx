'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getNotificationStatus } from '@/lib/notifications/schedule';

/** Campana con badge si las alertas del protocolo no están activas (estilo referencia). */
export default function NotificationBell() {
  const [needsAttention, setNeedsAttention] = useState(false);

  useEffect(() => {
    function sync() {
      setNeedsAttention(getNotificationStatus() !== 'granted');
    }
    sync();
    const id = window.setInterval(sync, 30_000);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('hypo-storage-sync', sync);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('hypo-storage-sync', sync);
    };
  }, []);

  return (
    <Link
      href="/yo#alertas"
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline/80 bg-white/80 text-ink shadow-soft backdrop-blur-sm transition-transform active:scale-95 hover:bg-white"
      aria-label={needsAttention ? 'Alerts: enable notifications' : 'Alerts and profile'}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.75}>
        <path
          d="M12 22a2 2 0 002-2H10a2 2 0 002 2zM18 16v-5c0-3.07-1.64-5.64-4.5-6.32V8a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2h16l-2-2z"
          strokeLinejoin="round"
        />
      </svg>
      {needsAttention ? (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />
      ) : null}
    </Link>
  );
}
