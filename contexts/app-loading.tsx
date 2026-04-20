'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import FullScreenLoader from '@/components/ui/FullScreenLoader';

type OverlayState = {
  title: string;
  subtitle: string;
} | null;

type Ctx = {
  show: (opts?: { title?: string; subtitle?: string }) => void;
  hide: () => void;
};

const AppLoadingContext = createContext<Ctx | null>(null);

export function AppLoadingProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState>(null);

  const show = useCallback((opts?: { title?: string; subtitle?: string }) => {
    setOverlay({
      title: opts?.title ?? 'Working on it…',
      subtitle: opts?.subtitle ?? 'This may take a moment.',
    });
  }, []);

  const hide = useCallback(() => setOverlay(null), []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <AppLoadingContext.Provider value={value}>
      {overlay ? (
        <FullScreenLoader title={overlay.title} subtitle={overlay.subtitle} />
      ) : null}
      {children}
    </AppLoadingContext.Provider>
  );
}

export function useAppLoading(): Ctx {
  const v = useContext(AppLoadingContext);
  if (!v) throw new Error('useAppLoading must be used within AppLoadingProvider');
  return v;
}
