import FastRing from '@/components/ui/FastRing';
import ProtocolTimeline from '@/components/ui/ProtocolTimeline';
import NewsFeed from '@/components/ui/NewsFeed';
import NotificationInit from '@/components/ui/NotificationInit';
import PageEnter from '@/components/ui/PageEnter';
import GeneIcon from '@/components/ui/GeneIcon';
import YesterdayCoach from '@/components/ui/YesterdayCoach';
import DidYouKnowBanner from '@/components/ui/DidYouKnowBanner';
import MiniCalendar from '@/components/ui/MiniCalendar';
import Link from 'next/link';

function todayLabel() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HoyPage() {
  return (
    <PageEnter>
    <div className="min-h-screen bg-background">
      <NotificationInit />

      {/* Header */}
      <div className="px-6 pt-12 pb-3">
        <p className="text-xs text-muted capitalize tracking-wide">{todayLabel()}</p>
        <div className="flex items-end justify-between mt-0.5">
          <h1 className="font-serif italic text-3xl text-ink">{greeting()}, Julio</h1>
          <Link href="/copiloto" className="flex items-center gap-1.5 bg-sage/10 text-sage text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage/15 transition-colors">
            <GeneIcon className="w-4 h-4 text-sage shrink-0" />
            Hypo
          </Link>
        </div>
      </div>

      {/* ¿Sabías que? — banner hero principal */}
      <DidYouKnowBanner />

      <YesterdayCoach />

      {/* Calendario + citas — justo debajo del banner */}
      <div className="mb-2">
        <p className="text-[10px] text-muted uppercase tracking-widest font-medium px-6 mb-2">Calendario</p>
        <MiniCalendar />
      </div>

      <div className="mx-6 border-t border-hairline mb-4" />

      {/* Anillo de ayuno (hoy) */}
      <div className="flex justify-center py-4">
        <FastRing />
      </div>

      {/* Ventana de ayuno + registrar */}
      <div className="px-6 mb-5 flex gap-3">
        <div className="flex-1 bg-surface rounded-card px-4 py-3 border border-hairline shadow-soft">
          <p className="text-[10px] text-muted uppercase tracking-widest font-medium">Ayuno</p>
          <p className="text-ink font-semibold text-sm mt-0.5">20:00 → 12:00 · 16h</p>
          <p className="text-[10px] text-muted mt-0.5">Comer: 12:00 – 20:00</p>
        </div>
        <Link href="/registrar" className="flex-none bg-sage text-white px-5 rounded-card font-semibold text-sm flex items-center gap-1.5 shadow-soft active:scale-[0.98] transition-transform">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          Registrar
        </Link>
      </div>

      <div className="mx-6 border-t border-hairline mb-4" />

      {/* Protocolo del día */}
      <div className="px-6 mb-6">
        <p className="text-[10px] text-muted uppercase tracking-widest font-medium mb-2">Protocolo de hoy</p>
        <ProtocolTimeline />
      </div>

      {/* Feed RSS */}
      <div className="px-6 pb-28">
        <p className="text-[10px] text-muted uppercase tracking-widest font-medium mb-1">Noticias</p>
        <NewsFeed />
      </div>
    </div>
    </PageEnter>
  );
}
