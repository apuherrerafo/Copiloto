'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import FastRing from '@/components/ui/FastRing';
import ProtocolTimeline from '@/components/ui/ProtocolTimeline';
import NewsFeed from '@/components/ui/NewsFeed';
import NotificationInit from '@/components/ui/NotificationInit';
import PageEnter from '@/components/ui/PageEnter';
import YesterdayCoach from '@/components/ui/YesterdayCoach';
import DidYouKnowBanner from '@/components/ui/DidYouKnowBanner';
import MiniCalendar from '@/components/ui/MiniCalendar';
import MotivationalHeader from '@/components/ui/MotivationalHeader';
import DailyCheckin from '@/components/ui/DailyCheckin';
import AlarmsPanel from '@/components/ui/AlarmsPanel';

export default function HoyPage() {
  return (
    <PageEnter>
      <div className="home-mesh min-h-screen">
        <NotificationInit />

        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(ellipse 100% 55% at 50% 100%, rgba(255,255,255,0.5) 0%, transparent 55%)',
            }}
          />

          <MotivationalHeader />

          <DailyCheckin />

          {/* 3 · Mi semana */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-0"
          >
            <MiniCalendar />
          </motion.div>

          {/* 4 · ¿Sabías que? + anillo */}
          <div className="mt-2 flex flex-col items-center gap-2 px-5 pb-0 pt-1">
            <DidYouKnowBanner compact />
            <FastRing />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-5 mt-3 flex max-w-sm justify-center px-5"
          >
            <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/70 bg-white/55 px-5 py-2.5 text-center shadow-glass backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Ayuno</span>
              <span className="text-[11px] font-bold text-ink">20:00 → 12:00 · 16 h</span>
              <span className="hidden h-3 w-px bg-hairline sm:block" />
              <span className="text-[11px] text-muted">Comer 12–20 h</span>
              <Link
                href="/registrar"
                className="ml-1 rounded-full bg-sage px-3 py-1 text-[11px] font-semibold text-white shadow-soft transition-transform active:scale-95"
              >
                + Registrar
              </Link>
            </div>
          </motion.div>
        </div>

        <YesterdayCoach />

        <AlarmsPanel />

        <div className="mx-5 mb-5 border-t border-hairline/80" />

        <div className="mx-4 mb-8">
          <ProtocolTimeline />
        </div>

        <div className="mx-5 pb-28">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">Noticias</p>
          <NewsFeed />
        </div>
      </div>
    </PageEnter>
  );
}
