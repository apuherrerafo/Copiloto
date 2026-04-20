'use client';

import { createContext, useCallback, useContext, useMemo, useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import BottomNav from '@/components/layout/BottomNav';
import { clearSession, type HypoSession } from '@/lib/auth/session';
import { clearAllLocalUserData } from '@/lib/store/clear-local';

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
  const { data: authSession, status, update } = useSession();

  const hypoSession = useMemo((): HypoSession | null => {
    if (status !== 'authenticated' || !authSession?.user) return null;
    const u = authSession.user;
    return {
      name: u.name?.trim() || 'Usuario',
      email: u.email ?? undefined,
      avatarUrl: u.image ?? undefined,
      avatarDataUrl: undefined,
      createdAt: 0,
    };
  }, [status, authSession]);

  const refresh = useCallback(() => {
    void update();
  }, [update]);

  const logout = useCallback(() => {
    void (async () => {
      clearSession();
      await clearAllLocalUserData();
      await signOut({ callbackUrl: '/entrar' });
    })();
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    const publicPaths = ['/entrar', '/registro'];
    if (status === 'unauthenticated' && !publicPaths.includes(pathname)) {
      router.replace('/entrar');
    }
    if (status === 'authenticated' && pathname === '/entrar') {
      router.replace('/');
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6">
        <div className="w-10 h-10 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        <p className="text-xs text-ink font-medium tracking-wide">HypoCopilot</p>
        <p className="text-[10px] text-muted text-center max-w-xs">Cargando…</p>
      </div>
    );
  }

  const showNav = status === 'authenticated' && pathname !== '/entrar';

  const value: Ctx = { session: hypoSession, refresh, logout };

  return (
    <SessionContext.Provider value={value}>
      {children}
      {showNav ? <BottomNav /> : null}
    </SessionContext.Provider>
  );
}
