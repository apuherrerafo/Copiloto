'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, getSession } from 'next-auth/react';
import BottomNav from '@/components/layout/BottomNav';
import HealthDisclaimerGate from '@/components/legal/HealthDisclaimerGate';
import { clearSession, readSession, type HypoSession } from '@/lib/auth/session';
import { clearAllLocalUserData } from '@/lib/store/clear-local';

type Ctx = {
  session: HypoSession | null;
  refresh: () => void;
  logout: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function useHypoSession(): Ctx {
  const v = useContext(SessionContext);
  if (!v) throw new Error('useHypoSession must be used within AppShell');
  return v;
}

const SESSION_LOAD_MS = 12_000;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: authSession, status, update } = useSession();
  const [sessionLoadTimedOut, setSessionLoadTimedOut] = useState(false);
  /** Re-render cuando cambia perfil/foto en localStorage (yo / sync) */
  const [sessionRevision, setSessionRevision] = useState(0);

  useEffect(() => {
    const bump = () => setSessionRevision((r) => r + 1);
    window.addEventListener('hypo-storage-sync', bump);
    return () => window.removeEventListener('hypo-storage-sync', bump);
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      setSessionLoadTimedOut(false);
      return;
    }
    const id = window.setTimeout(() => setSessionLoadTimedOut(true), SESSION_LOAD_MS);
    return () => window.clearTimeout(id);
  }, [status]);

  const hypoSession = useMemo((): HypoSession | null => {
    if (status !== 'authenticated' || !authSession?.user) return null;
    const u = authSession.user;
    const stored = typeof window !== 'undefined' ? readSession() : null;
    return {
      name: (stored?.name?.trim() || u.name?.trim() || 'Friend') as string,
      email: u.email ?? stored?.email,
      avatarUrl: u.image ?? undefined,
      avatarDataUrl: stored?.avatarDataUrl,
      createdAt: stored?.createdAt ?? 0,
    };
    // sessionRevision no aparece en el cuerpo, pero invalida readSession() tras hypo-storage-sync (perfil/foto).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, authSession, sessionRevision]);

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

  const showNav = status === 'authenticated' && pathname !== '/entrar';

  const value: Ctx = { session: hypoSession, refresh, logout };

  const loadingGate = status === 'loading' && !sessionLoadTimedOut;
  const timedOutGate = status === 'loading' && sessionLoadTimedOut;

  return (
    <SessionContext.Provider value={value}>
      {loadingGate ? (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-6">
          <div className="w-10 h-10 rounded-full border-2 border-sage border-t-transparent animate-spin" />
          <p className="text-xs text-ink font-medium tracking-wide">HypoCopilot</p>
          <p className="text-[10px] text-muted text-center max-w-xs">Loading…</p>
        </div>
      ) : timedOutGate ? (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-xs text-ink font-medium tracking-wide">HypoCopilot</p>
          <p className="text-sm text-muted text-center max-w-sm leading-relaxed">
            Your session is taking too long. Often a stale PWA cache or a flaky network connection.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                setSessionLoadTimedOut(false);
                void getSession();
              }}
              className="rounded-2xl bg-sage py-3 text-sm font-semibold text-white shadow-soft"
            >
              Retry session
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl border border-hairline bg-surface py-3 text-sm font-semibold text-ink"
            >
              Reload page
            </button>
            <Link
              href="/entrar"
              className="text-center text-sm font-semibold text-sage underline underline-offset-2 py-2"
            >
              Go to sign in
            </Link>
          </div>
          <p className="text-[10px] text-muted text-center max-w-xs leading-relaxed">
            If you installed the app on your phone: open it in the browser or clear site data for this URL, then sign in again.
          </p>
        </div>
      ) : (
        <>
          {status === 'authenticated' ? <HealthDisclaimerGate /> : null}
          {/* CSS-only tab transition — no double-mounting, no framer overhead */}
          <div key={pathname} className="animate-tab-in">
            {children}
          </div>
          {showNav ? <BottomNav /> : null}
        </>
      )}
    </SessionContext.Provider>
  );
}
