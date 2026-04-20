'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HypoMascot from '@/components/ui/HypoMascot';
import NotificationBell from '@/components/ui/NotificationBell';
import { useHypoSession } from '@/components/layout/AppShell';
import { getMotivationalMessage } from '@/lib/content/motivational';

function todayLabel() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

export default function MotivationalHeader({ name }: { name?: string }) {
  const { session } = useHypoSession();
  const displayName =
    session?.name?.trim().split(/\s+/)[0] ||
    name?.trim()?.split(/\s+/)[0] ||
    'Julio';
  const avatarSrc = session?.avatarDataUrl ?? session?.avatarUrl;
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMsg(getMotivationalMessage());
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsg(getMotivationalMessage(new Date()));
        setVisible(true);
      }, 400);
    }, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-5 pt-10 pb-2">
      {/* 1 · Perfil + saludo · campana · fecha */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/yo"
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-0.5 pr-2 transition-opacity active:opacity-90"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline/90 bg-white/90 shadow-soft ring-2 ring-white/80">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-serif text-lg italic text-sage">
                  {(session?.name ?? displayName).slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1 text-left leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{greeting()}</p>
              <p className="truncate font-serif text-[1.15rem] font-semibold italic text-ink md:text-[1.25rem]">
                {displayName} <span aria-hidden>☀️</span>
              </p>
            </div>
          </Link>
          <NotificationBell />
        </div>

        <p className="mt-2.5 text-center font-serif text-xs italic capitalize leading-tight text-muted">
          {todayLabel()}
        </p>
        <div className="mt-1 text-center">
          <AnimatePresence mode="wait">
            {visible && msg ? (
              <motion.p
                key={msg}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-[20rem] text-[13px] leading-snug text-muted"
              >
                {msg}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 2 · HypoAI buscador */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 flex gap-2.5 items-stretch"
      >
        <Link
          href="/copiloto"
          className="flex min-h-[52px] flex-1 min-w-0 items-center gap-3 rounded-full border border-white/70 bg-white/65 px-4 py-2.5 shadow-glass backdrop-blur-md transition-all active:scale-[0.99] hover:bg-white/80"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage/12 ring-1 ring-sage/15">
            <HypoMascot size={28} title="Hypo" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sage">HypoAI</p>
            <p className="truncate text-[15px] font-medium text-muted/80">Busca con HypoAI…</p>
          </div>
        </Link>

        <Link
          href="/copiloto"
          aria-label="Abrir Hypo"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-sage text-white shadow-lift transition-transform active:scale-95 hover:brightness-105"
        >
          <SparkleIcon className="h-6 w-6 opacity-95" />
        </Link>

        <Link
          href="/registrar"
          aria-label="Registrar"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-hairline bg-white/80 text-xl font-light leading-none text-sage shadow-soft backdrop-blur-md transition-transform active:scale-95 hover:bg-white"
        >
          +
        </Link>
      </motion.div>
    </div>
  );
}
