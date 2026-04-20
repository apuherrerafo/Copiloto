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
  // Refuerzo: si el estado quedara desincronizado, un getSession extra ayuda.
  useEffect(() => {
    const t = window.setTimeout(() => {
      void getSession();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

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
