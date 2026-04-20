'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NotificationBell from '@/components/ui/NotificationBell';
import MiniCalendar from '@/components/ui/MiniCalendar';
import { useHypoSession } from '@/components/layout/AppShell';
import { getMotivationalMessage } from '@/lib/content/motivational';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 19) return 'Good afternoon';
  return 'Good evening';
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

  return (
    <div className="pt-10 pb-2">
      {/* 1 · Perfil + saludo · campana · Mi semana */}
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

        <div className="mt-3">
          <MiniCalendar />
        </div>

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
    </div>
  );
}
