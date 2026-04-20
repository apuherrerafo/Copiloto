'use client';

import { useEffect } from 'react';
import { SessionProvider, getSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

export default function AuthSessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  // Si el servidor ya dijo “sin sesión”, no forzar otro fetch al montar (reduce flash de `loading` en /entrar).
  // Si hay sesión SSR, un getSession extra alinea borradores de cookie / otra pestaña.
  useEffect(() => {
    if (!session) return;
    const t = window.setTimeout(() => {
      void getSession();
    }, 0);
    return () => window.clearTimeout(t);
  }, [session]);

  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
