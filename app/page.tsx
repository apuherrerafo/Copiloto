'use client';

import { motion } from 'framer-motion';
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
import TodayStatusCards from '@/components/ui/TodayStatusCards';
import UpcomingAppointments from '@/components/ui/UpcomingAppointments';

export default function HoyPage() {
  return (
    <PageEnter>
      <div className="home-mesh min-h-screen">
        <NotificationInit />

        <div className="relative overflow-x-visible overflow-y-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(ellipse 100% 55% at 50% 100%, rgba(255,255,255,0.5) 0%, transparent 55%)',
            }}
          />

          <div className="px-safe">
            <MotivationalHeader />

            {/* 1 · Hero: estado del ayuno */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3"
            >
              <FastRing />
            </motion.div>

            {/* 2 · Estado de HOY (medicación / hidratación / cetosis) */}
            <div className="mt-5">
              <TodayStatusCards />
            </div>

            {/* 3 · Check-in diario */}
            <div className="mt-5">
              <DailyCheckin />
            </div>

            {/* 3 · Mi semana */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4"
            >
              <MiniCalendar />
            </motion.div>

            {/* 3b · Próximas citas médicas */}
            <div className="mt-5">
              <UpcomingAppointments />
            </div>

            {/* 4 · ¿Sabías que? */}
            <div className="mt-3 flex flex-col items-center gap-2">
              <DidYouKnowBanner compact />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <YesterdayCoach />
        </div>

        <AlarmsPanel />

        <div className="px-safe mb-5 border-t border-hairline/80" />

        <div className="px-safe mb-8">
          <ProtocolTimeline />
        </div>

        <div className="px-safe pb-nav-clear">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">News</p>
          <NewsFeed />
        </div>
      </div>
    </PageEnter>
  );
}
