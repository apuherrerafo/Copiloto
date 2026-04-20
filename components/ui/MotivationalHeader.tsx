'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HypoMascot from '@/components/ui/HypoMascot';
import NotificationBell from '@/components/ui/NotificationBell';
import { useHypoSession } from '@/components/layout/AppShell';
import { getMotivationalMessage } from '@/lib/content/motivational';

function todayParts() {
  const d = new Date();
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return {
    dayName,
    dayNum,
    month,
    year,
  };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 19) return 'Good afternoon';
  return 'Good evening';
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
    'there';
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

  const dateInfo = todayParts();

  return (
    <div className="pt-10 pb-2">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage">
                {greeting()}
              </p>
              <p className="truncate font-serif text-[1.35rem] italic text-ink md:text-[1.5rem]">
                <span className="font-semibold">{displayName}</span>
              </p>
            </div>
          </Link>
          <NotificationBell />
        </div>

        {/* Card fecha prominente */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 overflow-hidden rounded-[18px] border border-white/70 bg-gradient-to-br from-sage/20 via-white/70 to-amber/15 px-4 py-3 shadow-soft backdrop-blur-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/95 shadow-[0_6px_16px_-8px_rgba(91,122,101,0.35)] ring-1 ring-sage/20">
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] leading-none text-coral">
                {dateInfo.month.slice(0, 3).toUpperCase()}
              </span>
              <motion.span
                key={dateInfo.dayNum}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.15 }}
                className="mt-0.5 font-serif text-[26px] italic leading-none text-ink"
              >
                {dateInfo.dayNum}
              </motion.span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage/90">
                Today is
              </p>
              <p className="mt-0.5 font-serif text-[1.2rem] italic leading-tight text-ink">
                {dateInfo.dayName}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                {dateInfo.month} {dateInfo.dayNum}, {dateInfo.year}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-3 text-center">
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
        className="mt-4 flex min-w-0 gap-2 items-stretch sm:gap-2.5"
      >
        <Link
          href="/copiloto"
          className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-2 shadow-glass backdrop-blur-md transition-all active:scale-[0.99] hover:bg-white/80 sm:min-h-[52px] sm:gap-3 sm:px-4 sm:py-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sage/12 ring-1 ring-sage/15 sm:h-10 sm:w-10">
            <HypoMascot size={26} title="Hypo" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sage">HypoAI</p>
            <p className="truncate text-[14px] font-medium text-muted/80 sm:text-[15px]">Ask HypoAI…</p>
          </div>
        </Link>

        <Link
          href="/copiloto"
          aria-label="Open Hypo"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage text-white shadow-lift transition-transform active:scale-95 hover:brightness-105 sm:h-[52px] sm:w-[52px]"
        >
          <SparkleIcon className="h-5 w-5 opacity-95 sm:h-6 sm:w-6" />
        </Link>
      </motion.div>
    </div>
  );
}
