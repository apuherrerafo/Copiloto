import FastRing from '@/components/ui/FastRing';
import ProtocolTimeline from '@/components/ui/ProtocolTimeline';
import NewsFeed from '@/components/ui/NewsFeed';
import NotificationInit from '@/components/ui/NotificationInit';
import PageEnter from '@/components/ui/PageEnter';
import GeneIcon from '@/components/ui/GeneIcon';
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
      <div className="px-6 pt-12 pb-2">
        <p className="text-xs text-muted capitalize tracking-wide">{todayLabel()}</p>
        <div className="flex items-end justify-between mt-0.5">
          <h1 className="font-serif italic text-3xl text-ink">{greeting()}, Julio</h1>
          <Link href="/copiloto" className="flex items-center gap-1.5 bg-sage/10 text-sage text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage/15 transition-colors">
            <GeneIcon className="w-4 h-4 text-sage shrink-0" />
            Copiloto
          </Link>
        </div>
      </div>

      {/* Fast Ring — compact top section */}
      <div className="flex justify-center py-5">
        <FastRing />
      </div>

      {/* Eating window + register row */}
      <div className="px-6 mb-5 flex gap-3">
        <div className="flex-1 bg-surface rounded-card px-4 py-3 border border-hairline shadow-soft">
          <p className="text-[10px] text-muted uppercase tracking-widest font-medium">Ventana</p>
          <p className="text-ink font-semibold text-sm mt-0.5">12:00 — 20:00</p>
        </div>
        <Link href="/registrar" className="flex-none bg-sage text-white px-5 rounded-card font-semibold text-sm flex items-center gap-1.5 shadow-soft active:scale-[0.98] transition-transform">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          Registrar
        </Link>
      </div>

      {/* Protocol timeline — collapsible feel */}
      <div className="px-6 mb-6">
        <p className="text-[10px] text-muted uppercase tracking-widest font-medium mb-2">Protocolo de hoy</p>
        <ProtocolTimeline />
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-hairline mb-5"/>

      {/* Feed */}
      <div className="px-6 pb-28">
        <p className="text-[10px] text-muted uppercase tracking-widest font-medium mb-3">
          Tu feed — ciencia para tu estilo de vida
        </p>
        <NewsFeed />
      </div>
    </div>
    </PageEnter>
  );
}
