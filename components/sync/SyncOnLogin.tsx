'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useAppLoading } from '@/contexts/app-loading';
import { pullRemoteAndApply } from '@/lib/sync/pull';

/** Tras iniciar sesión, trae datos de la nube (Supabase) al dispositivo. */
export default function SyncOnLogin() {
  const { data, status } = useSession();
  const { show: showLoader, hide: hideLoader } = useAppLoading();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      lastUserId.current = null;
    }
    if (status !== 'authenticated' || !data?.user?.id) return;
    if (lastUserId.current === data.user.id) return;
    lastUserId.current = data.user.id;

    let cancelled = false;
    void (async () => {
      showLoader({
        title: 'Syncing your data…',
        subtitle: 'Bringing your timeline from the cloud. This may take a minute.',
      });
      try {
        await pullRemoteAndApply();
      } finally {
        if (!cancelled) hideLoader();
      }
    })();

    return () => {
      cancelled = true;
      hideLoader();
    };
  }, [status, data?.user?.id, showLoader, hideLoader]);

  return null;
}
