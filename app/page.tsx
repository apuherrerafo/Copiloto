'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Critical above-the-fold — loaded eagerly
import AbsorptionRing from '@/components/ui/AbsorptionRing';
import FastRing from '@/components/ui/FastRing';
import NotificationInit from '@/components/ui/NotificationInit';
import PageEnter from '@/components/ui/PageEnter';
import MotivationalHeader from '@/components/ui/MotivationalHeader';
import DailyCheckin from '@/components/ui/DailyCheckin';
import TodayStatusCards from '@/components/ui/TodayStatusCards';

// Below-the-fold — lazy-loaded after first paint
const EveningPROM = dynamic(() => import('@/components/ui/EveningPROM'), { ssr: false });
const UpcomingAppointments = dynamic(() => import('@/components/ui/UpcomingAppointments'), { ssr: false });
const DidYouKnowBanner = dynamic(() => import('@/components/ui/DidYouKnowBanner'), { ssr: false });
const YesterdayCoach = dynamic(() => import('@/components/ui/YesterdayCoach'), { ssr: false });
const AlarmsPanel = dynamic(() => import('@/components/ui/AlarmsPanel'), { ssr: false });
const ProtocolTimeline = dynamic(() => import('@/components/ui/ProtocolTimeline'), { ssr: false });
const NewsFeed = dynamic(() => import('@/components/ui/NewsFeed'), { ssr: false });

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

            {/* 0 · Post-pill absorption window (60 min from logged dose) */}
            <div className="mt-3">
              <AbsorptionRing />
            </div>

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

            <div className="mt-5">
              <EveningPROM />
            </div>

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
