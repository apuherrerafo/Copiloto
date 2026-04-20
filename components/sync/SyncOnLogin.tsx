'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { pullRemoteAndApply } from '@/lib/sync/pull';

/** Tras iniciar sesión, trae datos de la nube (Supabase) al dispositivo. */
export default function SyncOnLogin() {
  const { data, status } = useSession();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      lastUserId.current = null;
    }
    if (status !== 'authenticated' || !data?.user?.id) return;
    if (lastUserId.current === data.user.id) return;
    lastUserId.current = data.user.id;
    void pullRemoteAndApply();
  }, [status, data?.user?.id]);

  return null;
}
