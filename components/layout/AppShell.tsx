'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import { readSession, clearSession, type HypoSession } from '@/lib/auth/session';

type Ctx = {
  session: HypoSession | null;
  refresh: () => void;
  logout: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function useHypoSession(): Ctx {
  const v = useContext(SessionContext);
  if (!v) throw new Error('useHypoSession fuera de AppShell');
  return v;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<HypoSession | null>(null);

  const refresh = useCallback(() => {
    setSession(readSession());
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    router.replace('/entrar');
  }, [router]);

  useEffect(() => {
    refresh();
    setMounted(true);
  }, [refresh]);

  useEffect(() => {
    if (!mounted) return;
    if (!session && pathname !== '/entrar') {
      router.replace('/entrar');
    }
    if (session && pathname === '/entrar') {
      router.replace('/');
    }
  }, [mounted, session, pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6">
        <div className="w-10 h-10 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        <p className="text-xs text-ink font-medium tracking-wide">HypoCopilot</p>
        <p className="text-[10px] text-muted text-center max-w-xs">Cargando…</p>
      </div>
    );
  }

  /** Siempre renderizamos la ruta: el efecto redirige a /entrar si no hay sesión.
   *  Antes ocultábamos `children` y muchos navegadores se quedaban en spinner en blanco. */
  const showNav = !!session && pathname !== '/entrar';

  const value: Ctx = { session, refresh, logout };

  return (
    <SessionContext.Provider value={value}>
      {children}
      {showNav ? <BottomNav /> : null}
    </SessionContext.Provider>
  );
}
